from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from .serializers import ChatBotSerializer
from .models import ChatBot
import requests
import uuid
from Users.models import User
from django.utils import timezone

class ChatbotMessageView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        user_message = request.data.get('message')
        if not user_message:
            return Response({"error": "Message is required."}, status=status.HTTP_400_BAD_REQUEST)
        payload = {"sender": request.user.username, "message": user_message}
        response = requests.post("http://localhost:5005/webhooks/rest/webhook", json=payload)
        if response.status_code != 200:
            return Response({"error": "Failed to get a response from the chatbot."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        identify_user = response.json()
        user = User.objects.get(username=identify_user[0]['recipient_id']).id
        chatbot = ChatBot.objects.create(user=request.user,
                                          message=user_message,
                                          response=response.json()[0]['text'],
                                          timestamp=timezone.now(),
                                          id = uuid.uuid4())
        return Response(response.json())
