from .models import Movie
from .serializers import MovieSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import MovieSerializer,MovieDetailsSerializer
from .models import Movie
from .tasks import movie_scrap
from random import randint


class Home(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        movies = Movie.objects.all().order_by('-release_date')[:15]
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)


class MovieDetails(APIView):
    permission_classes = [AllowAny]

    def get(self, request, name):
        try:
            movie = Movie.objects.get(title=name)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=404)
        
        serializer = MovieDetailsSerializer(movie)
        return Response(serializer.data)
