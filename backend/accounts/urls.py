from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    AccountView,
    AdminUserViewSet,
    LoginView,
    LogoutView,
    PasswordResetConfirmView,
    PasswordResetRequestView,
    ProductViewSet,
    ProductSearchView,
    RegistrationView,
    health_check,
)

router = DefaultRouter()
router.register("users", AdminUserViewSet, basename="user")
router.register("products", ProductViewSet, basename="product")

urlpatterns = [
    path("health/", health_check, name="health"),
    path("auth/register/", RegistrationView.as_view(), name="register"),
    path("auth/login/", LoginView.as_view(), name="login"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/password-reset/request/", PasswordResetRequestView.as_view(), name="password-reset-request"),
    path("auth/password-reset/confirm/", PasswordResetConfirmView.as_view(), name="password-reset-confirm"),
    path("products/search/", ProductSearchView.as_view(), name="product-search"),
    path("account/", AccountView.as_view(), name="account"),
    path("", include(router.urls)),
]
