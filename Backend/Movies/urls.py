from django.urls import path, include
from .views import  Home, MovieDetails, MovieReviewView, MovieShowtimeView

urlpatterns = [
    path('home/', Home.as_view(), name="home"),
    path('<str:name>/', MovieDetails.as_view(), name="movie_detail"),
    path('<str:name>/reviews/', MovieReviewView.as_view(), name="movie_reviews"),
    path('<str:name>/showtimes/', MovieShowtimeView.as_view(), name="movie_showtimes"),
]
