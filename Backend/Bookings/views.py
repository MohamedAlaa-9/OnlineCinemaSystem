""" Views File for Booking App """
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from .models import Booking, Ticket
from Movies.models import Showtime, Movie

class AddToCart(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        showtime_starts_at = request.data.get('starts_at')
        count = int(request.data.get('count', 1))
        movie_price = Movie.objects.get(title = request.data.get('title')).ticket_price

        try:
            showtime = Showtime.objects.get(starts_at=showtime_starts_at)
            showtime_id = showtime.id
        except Showtime.DoesNotExist:
            print(request.data)
            return Response({"error": "Showtime not found"}, status=status.HTTP_404_NOT_FOUND)
        if showtime.available_seats < count:
            return Response({"error": "Not enough seats available"}, status=status.HTTP_400_BAD_REQUEST)
        total_price = movie_price * count
        booking, created = Booking.objects.get_or_create(user=user
                                                        ,showtime=showtime
                                                        ,status= 'Pending'
                                                        ,defaults={'tickets_count': count,
                                                                   'total_price': total_price})
        if not created:
            booking.tickets_count += count
            booking.total_price += movie_price * booking.tickets_count
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
                "movie_title": {
                    "title": booking.showtime.movie.title,
                    "poster": booking.showtime.movie.poster if booking.showtime.movie.poster else None
                },
                "theater_name": booking.showtime.cinema_hall.name,
                "showtime": booking.showtime.starts_at,
                "tickets_count": booking.tickets_count,
                "total_price": booking.total_price
            })
        return Response(cart_items, status=status.HTTP_200_OK)
    def put(self, request):
        title = request.data.get('title')
        new_count = int(request.data.get('new_count', 1))
        
        try:
            movie = Movie.objects.get(title=title)
        except Movie.DoesNotExist:
            return Response({"error": "Movie not found"}, status=status.HTTP_404_NOT_FOUND)
        try:
            booking = Booking.objects.get(
                user=request.user,
                status='Pending',
                showtime__movie=movie
            )
        except Booking.DoesNotExist:
            return Response({"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND)

        # Case 1: Delete booking if count is 0
        if new_count == 0:
            # Restore seats
            booking.showtime.available_seats += booking.tickets_count
            booking.showtime.save()
            booking.delete()
            return Response({"message": "Movie removed from cart"}, status=status.HTTP_200_OK)

        # Case 2: Update ticket count
        delta = new_count - booking.tickets_count
        if delta > 0 and booking.showtime.available_seats < delta:
            return Response({"error": "Not enough seats available"}, status=status.HTTP_400_BAD_REQUEST)

        booking.showtime.available_seats -= delta
        booking.showtime.save()

        booking.tickets_count = new_count
        booking.total_price = movie.ticket_price * new_count
        booking.save()

        return Response({"message": "Cart updated successfully"}, status=status.HTTP_200_OK)
