from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse
import requests
import json

def generate_verification_token(user):
    return default_token_generator.make_token(user)

def generate_verification_link(user, request):
    token = generate_verification_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = request.build_absolute_uri(reverse('verify-email', kwargs={'uidb64': uid, 'token': token}))
    return frontend_url

BREVO_API_KEY = "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"

def send_verification_email(user, verification_link):
    url = "https://api.brevo.com/v3/smtp/email"
    headers = {
        "accept": "application/json",
        "api-key": BREVO_API_KEY,
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
