from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import User

class CustomUserCreationForm(AdminUserCreationForm):
    usable_password = None

    class Meta:
        model = User
        fields = ["username"]

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = ["username", "about"]
