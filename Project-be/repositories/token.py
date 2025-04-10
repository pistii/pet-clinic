from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
REFRESH_TOKEN_EXPIRES_MIN = int(os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES"))

client = AsyncIOMotorClient(MONGO_URI)
db = client.get_database("pet_clinic")
token_collection = db.get_collection("refresh_tokens")
#Mongodb TTL behaviour: https://www.mongodb.com/docs/manual/core/index-ttl/#behavior


token_collection.create_index("expires_at", expireAfterSeconds=7200)
async def get_refresh_token(token: str):
    token_found = await token_collection.find_one({"refresh_token": token})
    return token_found

def add_refresh_token(token: str):
    return token_collection.insert_one({
                                        "refresh_token": token,
                                        "expires_at": datetime.now() + timedelta(minutes=REFRESH_TOKEN_EXPIRES_MIN)
                                        })


def remove_refresh_token(token: str):
    return token_collection.delete_one({"refresh_token": token})


def update_refresh_token(new_token: str, old_token: str):
    return token_collection.find_one_and_update({"refresh_token": old_token}, 
                                                {
                                                    "$set": {
                                                        "refresh_token": new_token,
                                                        "expires_at": datetime.now() + timedelta(minutes=REFRESH_TOKEN_EXPIRES_MIN)
                                                    }
                                                })