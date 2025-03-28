import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()


from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from chessapp.routing import websocket_urlpatterns
from channels.auth import AuthMiddlewareStack


# application = get_asgi_application()


application = ProtocolTypeRouter({

    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(websocket_urlpatterns)
    )

})