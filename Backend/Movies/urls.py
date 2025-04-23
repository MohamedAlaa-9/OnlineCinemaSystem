from django.urls import path, include
from .views import  Home#, MovieDetail

urlpatterns = [
    path('home/', Home.as_view(), name="home"),
    #path('movie/<str:name>/', MovieDetail.as_view(), name="movie_detail"),
]
