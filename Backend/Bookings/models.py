from django.db import models
import uuid


class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='user_booking')
    showtime = models.ForeignKey('Movies.Showtime', on_delete=models.CASCADE, related_name='showtime_booking')
    tickets_count = models.PositiveIntegerField()
    total_price = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        choices=[('Success', 'Success'), ('Pending', 'Pending'), ('Cancelled', 'Cancelled')],
        max_length=20
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='users_ticket')
    booking = models.ForeignKey('Bookings.Booking', on_delete=models.CASCADE, related_name='bookings_ticket')
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='movie')
    cinema_hall = models.ForeignKey('Movies.CinemaHall', on_delete=models.CASCADE, related_name='cinema_hall_ticket')
    seat_number = models.PositiveIntegerField()
    showtime = models.ForeignKey('Movies.Showtime', on_delete=models.CASCADE, related_name='showtime_ticket')
    price = models.DecimalField(max_digits=10, decimal_places=2)
    qr_code = models.ImageField(null=True, blank=True, upload_to='QR-Code/') #this qr code will contain the stripe transaction id to make employee scan it and check
    is_verified = models.BooleanField(default=False)
    verify_code = models.CharField(max_length=10, unique=True)
