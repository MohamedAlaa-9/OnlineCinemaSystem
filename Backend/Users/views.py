""" Views File For Users API EndPoints """
from rest_framework import generics, views, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils.timezone import now
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from .serializers import UserSerializer, UserProfileSerializer
from .utils import (
generate_verification_link, send_verification_email, send_reset_link, generate_reset_link )


User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """Register User API View"""
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_active = False
            user.save()
            # Verification Link Generator
            verification_link = generate_verification_link(user, request)
            send_verification_email(user, verification_link)
            return Response({"message": "Registration successful. Please check your email for verification."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyEmailView(views.APIView):
    """Verify Email API View"""
    permission_classes = [AllowAny]
    def get(self, request, uidb64, token):
        """Verify email using the token and uidb64"""
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return Response({"message": "Email verified successfully. You can now log in."},
                            status=status.HTTP_200_OK)
        return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)


class ResendVerificationEmailView(views.APIView):
    """Resend Verification Email API View"""
    permission_classes = [AllowAny]
    def post(self, request):
        """Resend verification email"""
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
            if user.is_active:
                return Response({"message": "This email is already verified."},
                                status=status.HTTP_400_BAD_REQUEST)
            verification_link = generate_verification_link(user, request)
            send_verification_email(user, verification_link)
            return Response({"message": "Verification email resent. Please check your inbox."},
                            status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email."},
                            status=status.HTTP_400_BAD_REQUEST)


class LoginView(views.APIView):
    """Login User API View"""
    permission_classes = [AllowAny]
    def post(self, request):
        """Login user and return JWT tokens"""
        username = request.data.get("username")
        password = request.data.get("password")
        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
        if not user.is_active:
            return Response({"Error": "Verify Your Email First"}, status=status.HTTP_406_NOT_ACCEPTABLE)
        if user is not None:
            user.last_login = now()
            user.save(update_fields=['last_login'])
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access_token": str(refresh.access_token),
                "refresh_token": str(refresh),
            },
            status=status.HTTP_200_OK,
        )

class LogoutView(views.APIView):
    """Logout User API View"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Logout user by blacklisting the refresh token"""
        try:
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"error": "Refresh token is required"},
                                status=status.HTTP_400_BAD_REQUEST)

            token = RefreshToken(refresh_token)
            token.blacklist()

            return Response({"message": "Successfully logged out"},
                            status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ForgotPasswordView(views.APIView):
    """Forgot Password API View"""
    def post(self, request):
        """Send password reset email"""
        email = request.data.get("email")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email."},
                            status=status.HTTP_400_BAD_REQUEST)
        reset_link = generate_reset_link(user=user, request=request)
        send_reset_link(user=user, verfifcation_link=reset_link)
        return Response({"message": "Password reset email sent."}, status=status.HTTP_200_OK)


class ResetPasswordConfirmView(views.APIView):
    """Reset Password Confirm API View"""
    permission_classes = [AllowAny]
    def post(self, request, uidb64, token):
        """Reset password using the token and uidb64"""
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid token"}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"},
                                status=status.HTTP_400_BAD_REQUEST)
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")

        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        if new_password is None:
            return Response({"error": "Password Required, Please Enter A New Password"})
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)

class ChangePasswordView(views.APIView):
    """Change Password API View"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Change user password"""
        user = request.user
        old_password = request.data.get("old_password")
        new_password = request.data.get("new_password")
        confirm_password = request.data.get("confirm_password")
        if not user.check_password(old_password):
            return Response({"error": "Old password is incorrect"},
                            status=status.HTTP_400_BAD_REQUEST)
        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save()
        return Response({"message": "Password changed successfully."}, status=status.HTTP_200_OK)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """User Profile API View"""
    queryset = User.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Get the user object"""
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Update user profile"""
        user = self.get_object()
        user.first_name = request.data.get('first_name', user.first_name)
        user.last_name = request.data.get('last_name', user.last_name)

        if 'profile_photo' in request.FILES:
            user.profile_photo = request.FILES['profile_photo']

        user.save()
        return Response({"message": "Profile updated successfully",
                        "profile": UserProfileSerializer(user).data}, status=status.HTTP_200_OK)
