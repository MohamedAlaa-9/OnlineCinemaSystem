from django.shortcuts import get_object_or_404
from Movies.models import Movie
from rest_framework import generics, permissions
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        movie_title = self.kwargs['movie_title']
        return Review.objects.filter(movie__title=movie_title).order_by('-created_at')

    def post(self, serializer):
        movie_title = self.kwargs['movie_title']
        movie = get_object_or_404(Movie, title=movie_title)
        serializer.save(user=self.request.user, movie=movie)
