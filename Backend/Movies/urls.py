from django.urls import path, include
from .views import  Home, MovieDetails

urlpatterns = [
    path('home/', Home.as_view(), name="home"),
    path('<str:name>/', MovieDetails.as_view(), name="movie_detail"),
    
]
