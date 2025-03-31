""" URL file for User API EndPoints """
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    RegisterView, VerifyEmailView, ResendVerificationEmailView,
    ForgotPasswordView, ResetPasswordConfirmView, ChangePasswordView,
    UserProfileView, LoginView, LogoutView )

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('verify-email/<uidb64>/<token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('resend-verification/', ResendVerificationEmailView.as_view(), name='resend-verification'),
    path('profile/', UserProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('password-reset/', ForgotPasswordView.as_view(), name='password-reset'),
    path('password-reset/confirm/<uidb64>/<token>/',
        ResetPasswordConfirmView.as_view(), name='password-reset-confirm'),
]
