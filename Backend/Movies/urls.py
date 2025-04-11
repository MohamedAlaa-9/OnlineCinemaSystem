from django.urls import path, include
from .views import  TMDBMoviesView

urlpatterns = [
#    path('', include(router.urls)),
    path('tmdb/', TMDBMoviesView.as_view(), name="tmdb-movies"),
]
