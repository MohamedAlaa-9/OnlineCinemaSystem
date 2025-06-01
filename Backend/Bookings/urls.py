""" Url Patterns for the Bookings app """
from django.urls import path
from .views import AddToCart
#, GetCart


urlpatterns= [
    path('BookNow/', AddToCart.as_view(), name='add_to_cart'),
    # path('cart/', GetCart.as_view(), name='get_cart'),
]
