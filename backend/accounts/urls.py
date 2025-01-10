
from django.urls import path, include
from accounts.views import GoogleLogin
from rest_framework_simplejwt.views import TokenVerifyView

urlpatterns = [
    path('', include('dj_rest_auth.urls')),
    path('registration/', include('dj_rest_auth.registration.urls')),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),
]
