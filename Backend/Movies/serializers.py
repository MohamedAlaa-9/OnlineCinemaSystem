from rest_framework import serializers
from .models import Movie

class MovieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['id', 'title', 'poster', 'release_date', 'imdb_rating', 'description', 'genres']

class MovieDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movie
        fields = ['title', 'poster', 'release_date', 'imdb_rating', 'description', 'actors', 'director', 'trailer_url', 'views_count', 'is_recent']
