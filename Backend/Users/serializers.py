from rest_framework import serializers
from django.contrib.auth import get_user_model
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
