from django.db import models
import uuid

class Genre(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    type = models.CharField(
        max_length=50, 
        choices=[
            ('Drama', 'Drama'), ('Comedy', 'Comedy'), ('Action', 'Action'), 
            ('Adventure', 'Adventure'), ('Horror', 'Horror'), ('Thriller', 'Thriller'), 
            ('Sci-Fi', 'Sci-Fi'), ('Romance', 'Romance'), ('Mystery', 'Mystery'), 
            ('Animation', 'Animation'), ('Sports', 'Sports')
        ]
    )

class Movie(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    poster = models.ImageField(upload_to='posters/')
    release_date = models.DateField()
    genres = models.ManyToManyField(Genre, related_name='movies')
    imdb_rating = models.FloatField()
    description = models.TextField()
    actors = models.TextField()
    director = models.CharField(max_length=255)
    views_count = models.PositiveIntegerField(default=0)
    is_recent = models.BooleanField(default=False)
    trailer_url = models.URLField()
    total_seats = models.PositiveIntegerField(default=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
