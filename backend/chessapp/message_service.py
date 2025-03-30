
from chessapp.messages import *
from asgiref.sync import async_to_sync



async def send_direct_message(sender, receiver, msg_type, payload):
    await sender.channel_layer.send(
        receiver.channel_name,
        {
            "type": msg_type,
            "payload": payload
        }
    )