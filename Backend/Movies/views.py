from .models import Movie
from .serializers import MovieSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .serializers import MovieSerializer,MovieDetailsSerializer
from .models import Movie
from .utils import movie_scrap
from random import randint


class Home(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        movie_scrap(page=randint(1,100))
        movies = Movie.objects.all().order_by('-release_date')[:10]
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data)


# class MovieDetail(APIView):
#     permission_classes = [AllowAny]
    
#     def get(self, request, name):
#         movie = Movie.objects.get(title=name)
#         try:
#             trailer = get_trailer(movie)
#             serializer = MovieDetailsSerializer(movie)
#             return Response(serializer.data)
#         except Movie.DoesNotExist:
#             return Response({"error": "Movie not found"}, status=404)
