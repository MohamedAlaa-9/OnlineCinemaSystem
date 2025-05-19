from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.shortcuts import reverse
import stripe
from Bookings.models import Booking, Ticket
from Movies.models import Showtime, CinemaHall
from django.http import HttpResponse
from django.views import View
import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.shortcuts import get_object_or_404
from .utlis import TicketPDFGenerator
from django.http import FileResponse, Http404
import os
from Movies.models import Movie, CinemaHall, Showtime
stripe.api_key = settings.STRIPE_API_KEY

class StripeCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            showtime_id = request.data.get('showtime_id')
            quantity = int(request.data.get('quantity', 1))
            price_id = 'price_1RJitkCAQaB8IpsnHtgWKKTI' #TODO: Change it dynamically based on the movie price via products in the stripe
            if not showtime_id or not price_id:
                return Response({"error": "Showtime ID and Price ID are required."}, status=status.HTTP_400_BAD_REQUEST)

            showtime = get_object_or_404(Showtime, id=showtime_id)

            if showtime.available_seats < quantity:
                return Response({"error": "Not enough seats available."}, status=status.HTTP_400_BAD_REQUEST)

            # Create a pending booking before checkout
            booking = Booking.objects.create(
                user=request.user,
                showtime=showtime,
                tickets_count=quantity,
                total_price=0,
                status='Pending'
            )
            
            # Create Stripe session with metadata
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        'price': price_id,
                        'quantity': quantity,
                    },
                ],
                mode='payment',
                customer_email=request.user.email,
                payment_method_types=['card'],
                success_url = f"{settings.BASE_URL}{reverse('ticket_download', args=[str(booking.id)])}?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url = f"{settings.BASE_URL}{reverse('payment_cancelled')}",
                metadata={'booking_id': str(booking.id)}
            )

            return Response({"checkout_url": checkout_session.url}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class PaymentCancelledView(View):
    def get(self, request):
        return HttpResponse("Payment was cancelled. Please try again.")

class StripeWebhookView(View):
    @csrf_exempt
    def post(self, request, *args, **kwargs):
        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
        endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except (ValueError, stripe.error.SignatureVerificationError):
            return JsonResponse({'error': 'Webhook signature verification failed'}, status=400)

        if event['type'] == 'checkout.session.completed':
            session = event['data']['object']
            booking_id = session.get('metadata', {}).get('booking_id')
            if not booking_id:
                return JsonResponse({'error': 'Missing booking ID in metadata'}, status=400)

            booking = get_object_or_404(Booking, id=booking_id)

            if session['payment_status'] == 'paid':
                booking.status = 'Success'
                booking.total_price = session['amount_total'] / 100
                booking.save()


        return JsonResponse({'status': 'success'}, status=200)



class DownloadTicketView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, booking_id):
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response({'error': 'Missing session_id'}, status=400)

        try:
            # 1. Verify Stripe session
            session = stripe.checkout.Session.retrieve(session_id)
            customer_email = session.customer_email

            # 2. Find related booking
            booking = Booking.objects.get(id=booking_id, user=request.user)
            if not booking:
                return Response({'error': 'Booking not found'}, status=404)

            # 3. Only proceed if payment succeeded
            if booking.status != 'Success':
                # Try to confirm it from Stripe if webhook didn’t run
                if session.payment_status == 'paid':
                    booking.status = 'Success'
                    booking.total_price = session.amount_total / 100
                    booking.save()
                else:
                    return Response({'error': 'Payment not confirmed yet'}, status=400)

            # 4. If no tickets, generate them here immediately
            tickets = Ticket.objects.filter(booking=booking)
            if not tickets.exists():
                showtime = booking.showtime
                for i in range(booking.tickets_count):
                    seat_number = showtime.available_seats - 1 - i
                    ticket = Ticket.objects.create(
                        user=booking.user,
                        booking=booking,
                        movie=showtime.movie,
                        cinema_hall=showtime.cinema_hall,
                        seat_number=seat_number,
                        showtime=showtime,
                        #price=booking.total_price / booking.tickets_count,
                        verify_code=f"VERIFY-{booking.id}-{i}"
                    )
                    ticket.save()
                showtime.available_seats -= booking.tickets_count
                showtime.save()
                tickets = Ticket.objects.filter(booking=booking)

            # 5. Generate ticket PDFs
            download_links = []
            for ticket in tickets:
                file_path = TicketPDFGenerator(ticket).build()
                filename = os.path.basename(file_path)
                download_url = f"{settings.BASE_URL}{file_path}"
                download_links.append(download_url)

            return Response({
                "message": f"{len(download_links)} ticket(s) ready",
                "download_links": download_links
            })

        except stripe.error.StripeError as e:
            return Response({'error': f'Stripe error: {str(e)}'}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

#TODO: Don't Miss to change session_id with {CECKOUT_SESSION_ID} in the success_url
