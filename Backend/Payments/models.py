from django.db import models
import uuid


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    booking_operation = models.ForeignKey('Bookings.Booking', on_delete=models.CASCADE)
    ticket = models.ForeignKey('Bookings.Ticket', on_delete=models.CASCADE, related_name='ticket_payment')
    user = models.ForeignKey('Users.User', on_delete=models.CASCADE, related_name='user_ticket')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    stripe_transaction_id = models.CharField(max_length=255, unique=True)
    status = models.CharField(
        choices=[('Success', 'Success'), ('Pending', 'Pending'), ('Cancelled', 'Cancelled')],
        max_length=20
    )
    created_at = models.DateTimeField(auto_now_add=True)
    timestamp = models.DateTimeField(auto_now=True)
