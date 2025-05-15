from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import reverse
import stripe
from Users.models import Profile
from Movies.models import  Showtime, Movie
from Bookings.models import Booking, Ticket, Showtime, CinemaHall
import json
import stripe
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.shortcuts import get_object_or_404
from django.http import FileResponse, Http404
from utlis import TicketPDFGenerator

stripe.api_key = settings.STRIPE_API_KEY

class StripeCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            showtime_id = request.data.get('showtime_id')
            quantity = int(request.data.get('quantity', 1))

            if not showtime_id:
                return Response({"error": "Showtime ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Fetch showtime
            try:
                showtime = Showtime.objects.get(id=showtime_id)
            except Showtime.DoesNotExist:
                return Response({"error": "Showtime not found."}, status=status.HTTP_404_NOT_FOUND)

            if showtime.available_seats < quantity:
                return Response({"error": "Not enough seats available."}, status=status.HTTP_400_BAD_REQUEST)

            # Stripe price_id for movie ticket (you should dynamically map this in production)
            price_id = request.data.get('price_id')  # Frontend should send correct Stripe price_id
            if not price_id:
                return Response({"error": "Stripe Price ID is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Create Stripe Checkout Session
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        'price': price_id,
                        'quantity': quantity,
                    },
                ],
                payment_method_types=['card'],
                mode='payment',
                customer_email=request.user.email,
                success_url=f'{settings.BASE_URL}{reverse("payment_successful")}?session_id={{CHECKOUT_SESSION_ID}}',
                cancel_url=f'{settings.BASE_URL}{reverse("payment_cancelled")}',
            )

            # Reserve seats temporarily
            showtime.available_seats -= quantity
            showtime.save()

            # Create booking with pending status
            booking = Booking.objects.create(
                user=request.user,
                showtime=showtime,
                tickets_count=quantity,
                total_price=0,  # Will be set after payment success via webhook
                status='Pending'
            )

            return Response({"checkout_url": checkout_session.url}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class StripeWebhookView(View):
    @csrf_exempt
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META['HTTP_STRIPE_SIGNATURE']
        endpoint_secret = stripe.api_key
        event = None
        
        try:
            # Verify the webhook signature
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        except ValueError as e:
            # Invalid payload
            return JsonResponse({'error': 'Invalid payload'}, status=400)
        except stripe.error.SignatureVerificationError as e:
            # Invalid signature
            return JsonResponse({'error': 'Invalid signature'}, status=400)

        # Handle the event types you need
        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']  # contains a stripe checkout session object
            
            # Find the booking from the session's metadata
            booking_id = session.get('metadata', {}).get('booking_id')
            if not booking_id:
                return JsonResponse({'error': 'No booking_id in metadata'}, status=400)
                
            booking = get_object_or_404(Booking, id=booking_id)

            # Check the payment status
            if session['payment_status'] == 'paid':
                # Update booking status to Success
                booking.status = 'Success'
                booking.total_price = session['amount_total'] / 100.0  # Convert to actual price in currency
                booking.save()

                # Create ticket entries
                showtime = booking.showtime
                for _ in range(booking.tickets_count):
                    ticket = Ticket.objects.create(
                        user=booking.user,
                        booking=booking,
                        movie=showtime.movie,
                        cinema_hall=showtime.cinema_hall,
                        seat_number=showtime.available_seats - 1,  # Decrease available seats
                        showtime=showtime,
                        price=booking.total_price / booking.tickets_count,  # Divide price by ticket count
                        qr_code=None,  # Generate QR code in the next step
                        is_verified=False,
                        verify_code="Generate a random code here"
                    )
                    # Update available seats for the showtime
                    showtime.available_seats -= 1
                    showtime.save()

                # Update booked movies for the user
                booked_movie = booking.showtime.movie
                Profile.booked_tickets.add(booked_movie)

        # Return a response acknowledging receipt of the event
        return JsonResponse({'status': 'success'}, status=200)


class DownloadTickets(APIView):
    def get(self, request, booking_id):
        tickets = Ticket.objects.filter(booking_id=booking_id, user=request.user)
        if not tickets.exists():
            raise Http404("No tickets found.")
        ticket_pdf = TicketPDFGenerator(tickets, poster_url=tickets[0].movie.poster_url).generate_pdf()
        saving = TicketPDFGenerator(tickets, poster_url=tickets[0].movie.poster_url).save_to_storage()
        if not saving:
            raise Http404("Failed to save PDF.")
        
        pdf_path = 
        return FileResponse(open(pdf_path, 'rb'), content_type='application/pdf')
