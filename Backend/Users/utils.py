from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.urls import reverse


def generate_verification_token(user):
    return default_token_generator.make_token(user)

def generate_verification_link(user, request):
    token = generate_verification_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    frontend_url = request.build_absolute_uri(reverse('verify-email', kwargs={'uidb64': uid, 'token': token}))
    return frontend_url
