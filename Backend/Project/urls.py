from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('Users.urls'), name='Users'),
    path('api/movies', include('Movies.urls'), name='Movies'),
    path('api/payments', include('Payments.urls'), name='Payments'),
    path('api/bookings', include('Bookings.urls'), name='Bookings'),
]
