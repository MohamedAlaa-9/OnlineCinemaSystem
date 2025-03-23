from django.db import models
import uuid

class Review(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='reviews')
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='reviews')
    rating = models.FloatField()
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
