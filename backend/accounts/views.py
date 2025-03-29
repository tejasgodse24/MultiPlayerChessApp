from chess import Status
from django.shortcuts import render
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client, OAuth2Error
from dj_rest_auth.registration.views import SocialLoginView
import logging

import jwt
from requests import Response

from rest_framework_simplejwt.views import TokenVerifyView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import UntypedToken
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.views import APIView
from django.conf import settings

User = get_user_model()

class GoogleLogin(SocialLoginView): # if you want to use Authorization Code Grant, use this
    adapter_class = GoogleOAuth2Adapter
    # adapter_class = CustomGoogleOAuth2Adapter
    # callback_url = "http://localhost:5173/"
    callback_url = settings.GOOGLE_LOGIN_CALLBACK_URL
    client_class = OAuth2Client


class CustomTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        print("hello")
        token = request.data.get("token")
        try:
            payload = UntypedToken(token)  # Decode token
            user_id = payload.get("user_id")

            user = User.objects.get(id=user_id)
            print("email",  user.email)
            return Response({
                "message": "Token is valid",
                "email": user.email
            }, status=status.HTTP_200_OK)
        
        except Exception as e:
            raise AuthenticationFailed("Invalid token")
