""" Views File for Booking App """
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Booking, Ticket
from Movies.models import Showtime

class AddToCart(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        showtime_id = request.data.get('showtime_id')
        count = int(request.data.get('count', 1))

        try:
            showtime = Showtime.objects.get(id=showtime_id)
        except Showtime.DoesNotExist:
            return Response({"error": "Showtime not found"}, status=status.HTTP_404_NOT_FOUND)
        if showtime.available_seats < count:
            return Response({"error": "Not enough seats available"}, status=status.HTTP_400_BAD_REQUEST)
        
        booking, created = Booking.objects.get_or_create(user=user
                                                        ,showtime=showtime
                                                        ,status= 'Pending'
                                                        ,defaults={'tickets_count': count, 
                                                                   'totlal_price': Ticket.price * count})
        if not created:
            booking.tickets_count += count
            booking.totlal_price += Ticket.price * booking.tickets_count
            booking.save()
        showtime.available_seats -= count
        showtime.save()
        return Response({"message": "Tickets added to cart successfully"}, status=status.HTTP_201_CREATED)


class GetCart(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        bookings = Booking.objects.filter(user=user, status='Pending')
        if not bookings.exists():
            return Response({"message": "No items in cart"}, status=status.HTTP_404_NOT_FOUND)
        
        cart_items = []
        for booking in bookings:
            cart_items.append({
                "showtime_id": booking.showtime.id,
                "movie_title": booking.showtime.movie.title,
                "theater_name": booking.showtime.theater.name,
                "showtime": booking.showtime.start_time,
                "tickets_count": booking.tickets_count,
                "total_price": booking.totlal_price
            })
        return Response(cart_items, status=status.HTTP_200_OK)

class CartUpdate(APIView):
    permission_classes = [IsAuthenticated]
    
    def put(self, request):
        booking_id = request.data.get('booking_id')
        new_count = int(request.data.get('new_count', 1))

        try:
            booking = Booking.objects.get(id=booking_id, user=request.user, status='Pending')
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)
        delta = new_count - booking.tickets_count
        if booking.showtime.available_seats < delta:
            return Response({"error": "Not enough seats available"}, status=status.HTTP_400_BAD_REQUEST)
        booking.showtime.available_seats -= delta
        booking.showtime.save()
        booking.tickets_count = new_count
        booking.totlal_price = Ticket.price * new_count
        booking.save()
        return Response({"message": "Cart updated successfully"}, status=status.HTTP_200_OK)
