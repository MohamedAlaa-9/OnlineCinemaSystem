from .views import ReviewListCreateView
from django.urls import path

urlpatterns = [
    path('movies/<str:movie_title>/reviews/', ReviewListCreateView.as_view(), name='movie-reviews'),
]
