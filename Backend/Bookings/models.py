from django.db import models
import uuid


class Showtime(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='movie')
    date = models.DateField()
    time = models.TimeField()
    available_seats = models.PositiveIntegerField()

class CinemaHall(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=50)
    total_seats = models.PositiveIntegerField()
    available_seats = models.PositiveIntegerField()
    showtime = models.ForeignKey('Bookings.Showtime', on_delete=models.CASCADE, related_name='showtime') 
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='movie')

class Booking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='user')
    showtime = models.ForeignKey('Bookings.Showtime', on_delete=models.CASCADE, related_name='showtime')
    tickets_count = models.PositiveIntegerField()
    total_price = models.FloatField()
    payment = models.ForeignKey('Payments.Payment', on_delete=models.CASCADE, related_name='payment', null=True, blank=True)
    status = models.CharField(
        choices=[('Success', 'Success'), ('Pending', 'Pending'), ('Cancelled', 'Cancelled')],
        max_length=20
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Ticket(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='users')
    booking = models.ForeignKey('Bookings.Booking', on_delete=models.CASCADE, related_name='bookings')
    movie = models.ForeignKey('Movies.Movie', on_delete=models.CASCADE, related_name='movie')
    cinema_hall = models.ForeignKey('Bookings.CinemaHall', on_delete=models.CASCADE, related_name='cinema_hall')
    seat_number = models.PositiveIntegerField()
    showtime = models.ForeignKey('Bookings.Showtime', on_delete=models.CASCADE, related_name='showtime')
    price = models.FloatField()
    qr_code = models.ImageField(null=True, blank=True, upload_to='QR-Code/') #this qr code will contain the stripe transaction id to make employee scan it and check
    is_verified = models.BooleanField(default=False)
