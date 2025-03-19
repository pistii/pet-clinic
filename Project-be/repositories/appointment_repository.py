from datetime import datetime
import os
from bson import ObjectId
from dotenv import load_dotenv

import pymongo.errors
from models.User import User, UserCreate
from motor.motor_asyncio import AsyncIOMotorClient

from models.Appointment import AppointmentUpdate, RequestAppointment, Appointment
from utils.converter import convert_object_ids


load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client_motor = AsyncIOMotorClient(MONGO_URI)
db_motor = client_motor.get_database("pet_clinic")
appointment_collection = db_motor.get_collection("appointment")

class AppointmentRepository:
    @staticmethod
    async def get_by_id(id: str):
        try:
            result = await appointment_collection.find_one({"id": id})
            return result
        except pymongo.errors.PyMongoError:
            print(f"Appointment not found: {result}")
    

    @staticmethod
    async def create_appointment(user: User, appointment: RequestAppointment):

        new_appointment = Appointment(
            description=appointment.description, 
            pet_id=str(appointment.pet_id),
            user_id=ObjectId(user.id)
        )
        appointment_dict = new_appointment.model_dump()
        
        try:
            inserted = await appointment_collection.insert_one(appointment_dict)
        except pymongo.errors.OperationFailure as e:
            print(f"Cannot insert element: {e._message}")
        return inserted
    
    @staticmethod
    async def get_assistant_appointments(start: datetime, end: datetime):
        
        cursor_result = appointment_collection.aggregate([
        {
            "$match": {  # szűrés az időpontra
                "time_of_appointment": {"$gte": start, "$lt": end }
            },
        },
        {
            "$lookup": {  # Join-like művelet
                "from": "users",  # A másik collection neve
                "localField": "user_id",  # Az appointment-ben lévő mező
                "foreignField": "_id",  # A users collection-ben az id
                "as": "user_info"  # Ide kerül a csatolt user adatai
            }
        },
        {
            "$unwind": "$user_info"  # iibontjuk az egyetlen user objektumot
        },
        {
            "$set": {
                "user_info.pets": {
                    "$filter": {
                        "input": "$user_info.pets",  # a pets lista
                        "as": "pet",
                        "cond": {"$eq": ["$$pet.pet_id", "$pet_id"]}  # csak a megfelelő pet_id maradjon
                    }
                }
            }
        },
        {
            "$set": {
                "user_info.pet": {"$arrayElemAt": ["$user_info.pets", 0]}  # az egyetlen megtalált pet
            }
        },
        {
            "$unset": ["user_info.pets", "_id", "user_id", "appointment_id", "pet_id", "user_info.password"]
        }
        ])
        
        res = await cursor_result.to_list()
        #print(f"result: {res}")
        res = convert_object_ids(res)
        return res


    @staticmethod
    async def update_appointment(appointment: AppointmentUpdate):
        result = await appointment_collection.find_one_and_update({"_id": str(appointment.id)}, appointment)
        return result
    
