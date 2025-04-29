from .models import Movie
from .serializers import MovieSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from .serializers import MovieSerializer,MovieDetailsSerializer, ReviewSerializer
from .models import Movie, Review
from random import randint
import uuid
from rest_framework import status

class Home(APIView):
    permission_classes = [AllowAny]
    
    def get(self, request):
        movies = Movie.objects.all().order_by('-release_date')[:15]
        serializer = MovieSerializer(movies, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class MovieDetails(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, name):
        try:
            movie = Movie.objects.get(title=name)
            
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=404)
        serializer = MovieDetailsSerializer(movie)
        return Response(serializer.data)

    def post(self, request, name):
        try:
            movie = Movie.objects.get(title=name)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ReviewSerializer(data=request.data)
        user = request.user.id
        if serializer.is_valid():
            review = serializer.save(
                movie_id=movie.id,
                user_id=user,
                id=uuid.uuid4()
            )
            return Response({"message": "Review added"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
