import json
import tempfile
from io import BytesIO
from pathlib import Path
from unittest.mock import MagicMock, patch

from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.test import TestCase
from PIL import Image as PILImage
from rest_framework.test import APIClient

from .gemini import GeminiConfigurationError, gerar_recomendacao_produto
from .models import Product

User = get_user_model()


class AccountApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

    def test_registration_login_and_account_crud(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "name": "Pessoa Teste",
                "email": "pessoa@example.com",
                "password": "CertaSenha!39",
                "privacy_accepted": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertIn("token", response.data)
        self.assertEqual(User.objects.count(), 1)
        user = User.objects.get(email="pessoa@example.com")
        self.assertIsNotNone(user.privacy_accepted_at)
        self.assertEqual(user.privacy_policy_version, "1.0")
        duplicate = self.client.post(
            "/api/auth/register/",
            {
                "name": "Outra Pessoa",
                "email": "PESSOA@example.com",
                "password": "OutraSenha!48",
                "privacy_accepted": True,
            },
            format="json",
        )
        self.assertEqual(duplicate.status_code, 400)
        self.assertEqual(User.objects.count(), 1)

        login = self.client.post(
            "/api/auth/login/",
            {"email": "PESSOA@example.com", "password": "CertaSenha!39"},
            format="json",
        )
        self.assertEqual(login.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {login.data['token']}")
        account = self.client.get("/api/account/")
        self.assertEqual(account.status_code, 200)
        self.assertEqual(account.data["name"], "Pessoa Teste")

        updated = self.client.patch("/api/account/", {"name": "Novo Nome"}, format="json")
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["name"], "Novo Nome")

        Product.objects.create(owner=user, name="Produto da conta")
        deleted = self.client.delete("/api/account/")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(User.objects.count(), 0)
        self.assertEqual(Product.objects.count(), 0)

    def test_registration_requires_privacy_acceptance(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "name": "Pessoa Teste",
                "email": "pessoa@example.com",
                "password": "CertaSenha!39",
                "privacy_accepted": False,
            },
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertEqual(User.objects.count(), 0)

    @override_settings(DEBUG=True)
    def test_demo_password_reset_invalidates_token_and_updates_password(self):
        user = User.objects.create_user(email="pessoa@example.com", first_name="Pessoa", password="CertaSenha!39")
        response = self.client.post(
            "/api/auth/password-reset/request/",
            {"email": user.email},
            format="json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("demo_token", response.data)

        reset = self.client.post(
            "/api/auth/password-reset/confirm/",
            {
                "email": user.email,
                "token": response.data["demo_token"],
                "password": "OutraSenha!48",
            },
            format="json",
        )
        self.assertEqual(reset.status_code, 200)
        user.refresh_from_db()
        self.assertTrue(user.check_password("OutraSenha!48"))

    def test_login_rejects_malformed_credentials(self):
        response = self.client.post(
            "/api/auth/login/",
            {"email": None, "password": None},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_admin_user_crud_is_not_public(self):
        response = self.client.get("/api/users/")
        self.assertEqual(response.status_code, 401)

    def test_staff_can_create_update_list_and_delete_users(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="AdminSenha!39",
        )
        self.client.force_authenticate(admin)
        created = self.client.post(
            "/api/users/",
            {
                "name": "Pessoa Gerenciada",
                "email": "gerenciada@example.com",
                "password": "SenhaGerenciada!39",
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        user_id = created.data["id"]

        updated = self.client.patch(
            f"/api/users/{user_id}/",
            {"name": "Nome Atualizado"},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.data["name"], "Nome Atualizado")
        self.assertEqual(self.client.get("/api/users/").status_code, 200)

        deleted = self.client.delete(f"/api/users/{user_id}/")
        self.assertEqual(deleted.status_code, 204)
        self.assertFalse(User.objects.filter(email="gerenciada@example.com").exists())

    @override_settings(GEMINI_API_KEY="")
    def test_product_search_requires_gemini_api_key(self):
        user = User.objects.create_user(email="pesquisa@example.com", password="SenhaValida!39")
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/products/search/",
            {"query": "Ryzen 7 9700X"},
            format="json",
        )
        self.assertEqual(response.status_code, 503)
        self.assertIn("GEMINI_API_KEY", response.data["detail"])

    def test_product_search_requires_authentication(self):
        response = self.client.post(
            "/api/products/search/",
            {"query": "Ryzen 7 9700X"},
            format="json",
        )
        self.assertEqual(response.status_code, 401)

    def test_product_search_rejects_short_queries(self):
        user = User.objects.create_user(email="pesquisa@example.com", password="SenhaValida!39")
        self.client.force_authenticate(user)
        response = self.client.post(
            "/api/products/search/",
            {"query": " "},
            format="json",
        )
        self.assertEqual(response.status_code, 400)

    def test_products_are_private_and_can_be_favorited_and_added_to_list(self):
        owner = User.objects.create_user(email="dono@example.com", password="SenhaValida!39")
        other_user = User.objects.create_user(email="outra@example.com", password="SenhaValida!39")
        self.assertEqual(self.client.get("/api/products/").status_code, 401)
        self.client.force_authenticate(owner)

        created = self.client.post(
            "/api/products/",
            {
                "name": "Produto real",
                "category": "Processador",
                "description": "Cadastrado pela pessoa usuária.",
            },
            format="json",
        )
        self.assertEqual(created.status_code, 201)
        product_id = created.data["id"]

        updated = self.client.patch(
            f"/api/products/{product_id}/",
            {"is_favorite": True, "in_shopping_list": True},
            format="json",
        )
        self.assertEqual(updated.status_code, 200)
        self.assertTrue(updated.data["is_favorite"])
        self.assertTrue(updated.data["in_shopping_list"])
        self.assertEqual(len(self.client.get("/api/products/favorites/").data), 1)
        self.assertEqual(len(self.client.get("/api/products/shopping-list/").data), 1)

        self.client.force_authenticate(other_user)
        self.assertEqual(self.client.get("/api/products/").data, [])
        self.assertEqual(self.client.get(f"/api/products/{product_id}/").status_code, 404)

        self.client.force_authenticate(owner)
        self.assertEqual(self.client.delete(f"/api/products/{product_id}/").status_code, 204)

    def test_product_categories_are_limited_to_the_available_choices(self):
        user = User.objects.create_user(email="categorias@example.com", password="SenhaValida!39")
        self.client.force_authenticate(user)

        categories = self.client.get("/api/products/categories/")
        self.assertEqual(categories.status_code, 200)
        self.assertIn("Gabinete", categories.data)

        response = self.client.post(
            "/api/products/",
            {"name": "Produto", "category": "Categoria inventada"},
            format="json",
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("category", response.data)

    def test_product_image_is_saved_and_deleted_with_the_product(self):
        user = User.objects.create_user(email="imagem@example.com", password="SenhaValida!39")
        self.client.force_authenticate(user)
        imagem = BytesIO()
        PILImage.new("RGB", (2, 2), color="green").save(imagem, format="PNG")
        arquivo = SimpleUploadedFile("produto.png", imagem.getvalue(), content_type="image/png")

        with tempfile.TemporaryDirectory() as media_root:
            with override_settings(MEDIA_ROOT=media_root):
                created = self.client.post(
                    "/api/products/",
                    {"name": "Produto com foto", "category": "Gabinete", "image": arquivo},
                    format="multipart",
                )
                self.assertEqual(created.status_code, 201)
                self.assertTrue(created.data["image"].endswith(".png"))
                produto = Product.objects.get(id=created.data["id"])
                caminho_imagem = Path(produto.image.path)
                self.assertTrue(caminho_imagem.is_file())

                deleted = self.client.delete(f"/api/products/{produto.id}/")
                self.assertEqual(deleted.status_code, 204)
                self.assertFalse(caminho_imagem.exists())

    @patch("accounts.views.gerar_recomendacao_produto")
    def test_product_search_returns_gemini_recommendation(self, mock_search):
        user = User.objects.create_user(email="pesquisa@example.com", password="SenhaValida!39")
        self.client.force_authenticate(user)
        mock_search.return_value = {
            "answer": "Compare o consumo de energia do modelo.",
            "model": "gemini-test",
        }

        response = self.client.post(
            "/api/products/search/",
            {"query": "  Ryzen 7 9700X  "},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["query"], "Ryzen 7 9700X")
        self.assertEqual(response.data["answer"], "Compare o consumo de energia do modelo.")
        mock_search.assert_called_once_with("Ryzen 7 9700X")

    @override_settings(GEMINI_API_KEY="test-key", GEMINI_MODEL="gemini-3.6-flash")
    @patch("accounts.gemini.urlopen")
    def test_gemini_recommendation_uses_free_model_without_web_search(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.__enter__.return_value = mock_response
        mock_response.read.return_value = json.dumps({
            "steps": [
                {
                    "type": "model_output",
                    "content": [
                        {
                            "type": "text",
                            "text": "Compare consumo de energia e garantia.",
                        }
                    ],
                }
            ]
        }).encode("utf-8")
        mock_urlopen.return_value = mock_response

        resultado = gerar_recomendacao_produto("Ryzen 7 9700X")

        self.assertEqual(resultado["answer"], "Compare consumo de energia e garantia.")
        self.assertEqual(resultado["model"], "gemini-3.6-flash")
        requisicao = mock_urlopen.call_args.args[0]
        payload = json.loads(requisicao.data)
        self.assertEqual(payload["model"], "gemini-3.6-flash")
        self.assertNotIn("tools", payload)
        self.assertEqual(requisicao.get_header("X-goog-api-key"), "test-key")

    @override_settings(GEMINI_API_KEY="")
    def test_gemini_search_reports_missing_api_key(self):
        with self.assertRaises(GeminiConfigurationError):
            gerar_recomendacao_produto("Ryzen 7 9700X")
