from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('Users.urls'), name='Users'),
    path('api/movies/', include('Movies.urls'), name='Movies'),
    path('api/stripe/', include('Payments.urls'), name='Payments'),
    path('api/bookings/', include('Bookings.urls'), name='Bookings'),
    path('api/help/', include('ChatBot.urls'), name='ChatBot'),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
