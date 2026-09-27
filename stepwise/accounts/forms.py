from django.contrib.auth.forms import AdminUserCreationForm, UserChangeForm

from .models import User

class CustomUserCreationForm(AdminUserCreationForm):

    class Meta:
        model = User
        fields = ["username", "about"]

class CustomUserChangeForm(UserChangeForm):

    class Meta:
        model = User
        fields = ["username", "about"]
