from django.db import models
import uuid
from django.contrib.auth.models import AbstractUser, Group, Permission

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    groups = models.ManyToManyField(
        Group, related_name="user_groups"
    )



class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_profile')
    booked_tickets = models.PositiveIntegerField(default=0)
    profile_photo = models.ImageField(upload_to='profiles/', null=True, blank=True)

class Admin(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    date_joined = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(
        Group, related_name="admin_groups"
    )

    user_permissions = models.ManyToManyField(
        Permission, related_name="admin_permissions"
    )
class Employee(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    role = models.CharField(max_length=50)
    date_joined = models.DateTimeField(auto_now_add=True)
    groups = models.ManyToManyField(
        Group, related_name="employee_groups"
    )
    user_permissions = models.ManyToManyField(
        Permission, related_name='employee_permissions'
    )
