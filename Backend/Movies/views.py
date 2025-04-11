from .models import Movie
from .serializers import MovieSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import MovieSerializer
from .models import Movie
from .utils import movie_scrap

class TMDBMoviesView(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        movie_scrap(page=3)
        movies = Movie.objects.all()
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)
