import os
from typing import Union
from dotenv import load_dotenv

from motor.motor_asyncio import AsyncIOMotorClient
import pymongo.errors

from models.User import User
from models.Pet import Pet

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client_motor = AsyncIOMotorClient(MONGO_URI)
db_motor = client_motor.get_database("pet_clinic")
users_collection = db_motor.get_collection("users")

class PetRepository:
    @staticmethod
    async def get_all_by_email(email: str):
        try:
            user = await users_collection.find_one({"email": email})
            return user["pets"]
        except pymongo.errors.CursorNotFound:
            return "User not found"
        except pymongo.errors.NetworkTimeout:
            return "Request timed out"
        except Exception as e:
            print(f"Error while requesting user: {e}")


    @staticmethod
    async def insert_pet(user: Union[User, dict], pet: Pet) -> Pet:
        #user can be dict or User obj
        try:
            user_email = user.email if isinstance(user, User) else user["email"]
            
            added = await users_collection.update_one(
                {"email": user_email},
                {"$push": {"pets": pet.model_dump()}}
            )

            if (added.modified_count == 1):
                return pet
        except pymongo.errors.WriteError as e:
            print(f"Error while inserting pet: {e}")
