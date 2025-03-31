from rest_framework import serializers
from django.contrib.auth import get_user_model
from Bookings.models import Booking

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'first_name', 'last_name']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, attrs):
        if User.objects.filter(email=attrs).exists():
            raise serializers.ValidationError('A User With Same Email Already Exists, Login Exists ?!')
        if User.objects.filter(username = attrs).exists():
            raise serializers.ValidationError('A User With Same Username Already Exists, Login Exists ?!')
        return attrs
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class UserProfileSerializer(serializers.ModelSerializer):
    booked_tickets = serializers.SerializerMethodField()
    change_password_link = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'profile_photo', 'date_joined', 'last_login', 'booked_tickets', 'change_password_link']

    def get_booked_tickets(self, obj):
        bookings = Booking.objects.filter(user=obj)
        return [{'movie_title': b.movie_title, 'booked_at': b.booked_at} for b in bookings]

    def get_change_password_link(self, obj):
        return "http://127.0.0.1:8000/api/users/change-password/"
