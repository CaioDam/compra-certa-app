from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from rest_framework import serializers

from .models import PRIVACY_POLICY_VERSION, Product

User = get_user_model()


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        return value.strip().lower()


class PasswordResetConfirmSerializer(serializers.Serializer):
    email = serializers.EmailField()
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate_email(self, value):
        return value.strip().lower()


class ProductSearchSerializer(serializers.Serializer):
    query = serializers.CharField(min_length=2, max_length=120, trim_whitespace=True)


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", max_length=150)

    class Meta:
        model = User
        fields = ("id", "name", "email")
        read_only_fields = ("id",)

    def validate_email(self, value):
        email = value.strip().lower()
        query = User.objects.filter(email__iexact=email)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email


class RegistrationSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", max_length=150)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    privacy_accepted = serializers.BooleanField(write_only=True)

    class Meta:
        model = User
        fields = ("id", "name", "email", "password", "privacy_accepted")
        read_only_fields = ("id",)

    def create(self, validated_data):
        validated_data.pop("privacy_accepted")
        return User.objects.create_user(
            **validated_data,
            privacy_accepted_at=timezone.now(),
            privacy_policy_version=PRIVACY_POLICY_VERSION,
        )

    def validate_privacy_accepted(self, value):
        if not value:
            raise serializers.ValidationError("É necessário aceitar o aviso de privacidade.")
        return value

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email


class AccountUpdateSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name", max_length=150, required=False)

    class Meta:
        model = User
        fields = ("id", "name", "email")
        read_only_fields = ("id",)

    def validate_email(self, value):
        email = value.strip().lower()
        query = User.objects.filter(email__iexact=email)
        if self.instance:
            query = query.exclude(pk=self.instance.pk)
        if query.exists():
            raise serializers.ValidationError("Este e-mail já está cadastrado.")
        return email


class AdminUserSerializer(UserSerializer):
    password = serializers.CharField(write_only=True, validators=[validate_password], required=False)

    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ("password",)

    def create(self, validated_data):
        password = validated_data.pop("password", None)
        if not password:
            raise serializers.ValidationError({"password": "Este campo é obrigatório."})
        return User.objects.create_user(password=password, **validated_data)

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)
        instance = super().update(instance, validated_data)
        if password:
            instance.set_password(password)
            instance.save(update_fields=["password"])
        return instance


class ProductSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Product
        fields = ("id", "name", "category", "description", "image", "is_favorite", "in_shopping_list")
        read_only_fields = ("id",)

    def validate_image(self, value):
        if value and value.size > 5 * 1024 * 1024:
            raise serializers.ValidationError("A imagem deve ter no máximo 5 MB.")
        return value
