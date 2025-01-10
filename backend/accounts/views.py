from chess import Status
from django.shortcuts import render
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client, OAuth2Error
from dj_rest_auth.registration.views import SocialLoginView
import logging

import jwt
from requests import Response


class GoogleLogin(SocialLoginView): # if you want to use Authorization Code Grant, use this
    adapter_class = GoogleOAuth2Adapter
    # adapter_class = CustomGoogleOAuth2Adapter
    callback_url = "http://localhost:5173/"
    client_class = OAuth2Client

    
