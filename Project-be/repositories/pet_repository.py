import os
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
    async def insert_pet(user: User, pet: Pet) -> Pet:
        try:
            added = await users_collection.update_one(
                {"email": user.email},
                {"$push": {"pets": pet.model_dump()}}
            )
            if (added.modified_count == 1):
                return pet
        except pymongo.errors.WriteError as e:
            print(f"Error while inserting pet: {e}")
