from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.tokens import default_token_generator
from rest_framework import generics, permissions, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView

from .gemini import GeminiConfigurationError, GeminiUpstreamError, gerar_recomendacao_produto
from .models import Product
from .serializers import (
    AccountUpdateSerializer,
    AdminUserSerializer,
    LoginSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    ProductSerializer,
    ProductSearchSerializer,
    RegistrationSerializer,
    UserSerializer,
)

User = get_user_model()


class RegistrationView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response(
            {"token": token.key, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response(
                {"detail": "E-mail ou senha inválidos."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"token": token.key, "user": UserSerializer(user).data})


class LogoutView(APIView):
    def post(self, request):
        request.auth.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AccountView(APIView):
    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = AccountUpdateSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)

    def delete(self, request):
        for product in request.user.products.all():
            if product.image:
                product.image.delete(save=False)
        request.user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all().order_by("id")
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAdminUser]


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        response_data = {"detail": "Se o e-mail estiver cadastrado, enviaremos as instruções."}
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if user:
            reset_token = default_token_generator.make_token(user)
            if settings.DEBUG:
                response_data["demo_token"] = reset_token
                response_data["uid"] = user.pk
        return Response(response_data)


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]
        reset_token = serializer.validated_data["token"]
        password = serializer.validated_data["password"]
        user = User.objects.filter(email__iexact=email, is_active=True).first()
        if not user or not default_token_generator.check_token(user, reset_token):
            return Response(
                {"token": "Código inválido ou expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password, user)
        except DjangoValidationError as error:
            return Response({"password": list(error.messages)}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(password)
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response({"detail": "Senha redefinida com sucesso."})


class ProductSearchView(APIView):
    throttle_scope = "product_search"

    def post(self, request):
        serializer = ProductSearchSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        query = serializer.validated_data["query"]
        try:
            resultado = gerar_recomendacao_produto(query)
        except GeminiConfigurationError as error:
            return Response({"detail": str(error)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        except GeminiUpstreamError as error:
            return Response({"detail": str(error)}, status=status.HTTP_502_BAD_GATEWAY)
        return Response({"query": query, **resultado})


class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        produtos = Product.objects.filter(owner=self.request.user)
        if self.action == "favorites":
            return produtos.filter(is_favorite=True)
        if self.action == "shopping_list":
            return produtos.filter(in_shopping_list=True)
        category = self.request.query_params.get("category")
        if category:
            produtos = produtos.filter(category__iexact=category)
        return produtos

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=["get"])
    def favorites(self, request):
        return Response(self.get_serializer(self.get_queryset(), many=True).data)

    @action(detail=False, methods=["get"], url_path="shopping-list")
    def shopping_list(self, request):
        return Response(self.get_serializer(self.get_queryset(), many=True).data)

    @action(detail=False, methods=["get"])
    def categories(self, request):
        return Response([value for value, label in Product._meta.get_field("category").choices])

    def perform_update(self, serializer):
        imagem_antiga = serializer.instance.image
        produto = serializer.save()
        if imagem_antiga and imagem_antiga != produto.image:
            imagem_antiga.delete(save=False)

    def perform_destroy(self, instance):
        if instance.image:
            instance.image.delete(save=False)
        instance.delete()


@api_view(["GET"])
@permission_classes([permissions.AllowAny])
def health_check(request):
    return Response({"status": "ok"})
