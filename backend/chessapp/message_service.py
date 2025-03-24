
from chessapp.messages import *
from asgiref.sync import async_to_sync


# def send_direct_message(sender, reciever, msg_type, payload):
#     async_to_sync(sender.channel_layer.send)(
#             reciever.channel_name,
#             {
#                 "type": msg_type, 
#                 "payload":payload
#             }
#         )


async def send_direct_message(sender, receiver, msg_type, payload):
    await sender.channel_layer.send(
        receiver.channel_name,
        {
            "type": msg_type,
            "payload": payload
        }
    )