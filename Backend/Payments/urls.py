from django.urls import path
from .views import DownloadTicketView, StripeCheckoutView, StripeWebhookView, PaymentCancelledView


urlpatterns= [
    path('ticket_download/<uuid:booking_id>', DownloadTicketView.as_view(), name='ticket_download'),
    path('create-checkout-session/', StripeCheckoutView.as_view(), name='create_checkout_session'),
    path('webhook/', StripeWebhookView.as_view(), name='stripe_webhook'),
    path('payment-cancelled/', PaymentCancelledView.as_view(), name='payment_cancelled'),

]
