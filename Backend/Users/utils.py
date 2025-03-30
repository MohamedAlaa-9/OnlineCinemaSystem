from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import requests
import json
from Project import settings


def generate_verification_token(user):
    return default_token_generator.make_token(user)

def generate_verification_link(user, request):
    token = generate_verification_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = request.build_absolute_uri(reverse('verify-email', kwargs={'uidb64': uid, 'token': token}))
    return frontend_url

def send_verification_email(user, verification_link):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": settings.BREVO_API_KEY,
        "content-type": "application/json"
    }
    data = {
        "sender": {"name": "Online Cinema", "email": "youssefbassem42@gmail.com"},
        "to": [{"email": user.email}],
        "subject": "Verify Your Email - Online Cinema System",
        "htmlContent": f"<p>Click <a href='{verification_link}'>here</a> to verify your email.</p>"
    }

    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()


# Reset Links
def send_reset_link(user, verfifcation_link):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key" : settings.BREVO_RESET_PASSWORD_API,
        "content-type" : "application/json" 
    }
    data = {
        "sender" : {"name": "Online Cinema", "email": "youssefbassem42@gmail.com"},
        "to": [{"email": user.email}],
        "subject": "Reset Your Password - Online Cinema System",
        "htmlContent": f"<p> Click <a href= '{verfifcation_link}'> Here </a> to Reset Your Password. </p>"
    }
    response = requests.post(url, headers=headers, data=json.dumps(data))
    return response.json()

def generate_reset_link(user, request):
    token = generate_verification_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = request.build_absolute_uri(reverse('password-reset-confirm', kwargs={'uidb64': uid, 'token': token}))
    return frontend_url
