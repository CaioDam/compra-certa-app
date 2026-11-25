from django.contrib.auth.models import AbstractUser
from django.contrib.auth.base_user import BaseUserManager
from django.conf import settings
from django.db import models


PRIVACY_POLICY_VERSION = "1.0"

CATEGORIAS_PRODUTO = (
    ("Processador", "Processador"),
    ("Gabinete", "Gabinete"),
    ("Placa de vídeo", "Placa de vídeo"),
    ("Placa-mãe", "Placa-mãe"),
    ("Memória RAM", "Memória RAM"),
    ("SSD", "SSD"),
    ("Fonte", "Fonte"),
    ("Cooler", "Cooler"),
    ("Monitor", "Monitor"),
    ("Teclado", "Teclado"),
    ("Mouse", "Mouse"),
    ("Fone de ouvido", "Fone de ouvido"),
    ("Notebook", "Notebook"),
    ("Celular", "Celular"),
    ("TV", "TV"),
    ("Cadeira Gamer", "Cadeira Gamer"),
    ("Outro", "Outro"),
)


class UserManager(BaseUserManager):
    use_in_migrations = True

    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("O e-mail é obrigatório.")
        user = self.model(email=self.normalize_email(email).strip().lower(), **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        if not extra_fields["is_staff"] or not extra_fields["is_superuser"]:
            raise ValueError("Superusuários precisam ter is_staff e is_superuser ativos.")
        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    privacy_accepted_at = models.DateTimeField(null=True, blank=True)
    privacy_policy_version = models.CharField(max_length=20, blank=True)
    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []


class Product(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="products")
    name = models.CharField(max_length=120)
    category = models.CharField(max_length=40, choices=CATEGORIAS_PRODUTO)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="products/%Y/%m/", blank=True, null=True)
    is_favorite = models.BooleanField(default=False)
    in_shopping_list = models.BooleanField(default=False)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name
