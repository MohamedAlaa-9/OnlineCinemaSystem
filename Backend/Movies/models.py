from django.db import models
import uuid

class Genre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(max_length=255)
    type_id = models.CharField(max_length=255, default= 0)

class Movie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=300)
    poster = models.URLField(blank=True, null=True)
    release_date = models.DateField()
    genres = models.ManyToManyField(Genre, related_name='movies_genre')
    imdb_rating = models.FloatField()
    description = models.TextField()
    actors = models.TextField(null=True)
    director = models.TextField()
    trailer_url = models.TextField()
    seats_available = models.PositiveIntegerField()
    total_seats = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
class Showtime(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='movie_showtime')
    date = models.DateField()
    time = models.TimeField()
    available_seats = models.PositiveIntegerField()
    cinema_hall = models.ForeignKey('Movies.CinemaHall', on_delete= models.CASCADE, related_name='showtime_cinemahall')
    
class CinemaHall(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    showtime = models.ForeignKey('Movies.Showtime', on_delete=models.CASCADE, related_name='cinemahall_showtime')
    movie = models.ManyToManyField('Movies.Movie', related_name='movie_cinema_hall')
