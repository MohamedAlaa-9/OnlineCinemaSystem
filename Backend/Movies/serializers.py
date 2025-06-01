from rest_framework import serializers
from .models import Movie, Review, Showtime

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['title', 'poster', 'release_date', 'imdb_rating', 'description', 'genres']

class MovieDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['title', 'poster', 'release_date', 'imdb_rating', 'description', 'actors', 'director', 'trailer_url', 'genres', 'seats_available', 'total_seats']
        read_only_fields = ['seats_available', 'total_seats']

class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    movie = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Review
        fields = ['id', 'user', 'movie', 'rating', 'comment', 'created_at']

class ShowtimesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Showtime
        fields = ['id','starts_at', 'available_seats']
