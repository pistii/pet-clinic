from datetime import datetime
import os
from bson import ObjectId
from dotenv import load_dotenv

from fastapi import HTTPException
from fastapi.responses import JSONResponse
import pymongo.errors
from models.User import UnregisteredUserForm, User
from motor.motor_asyncio import AsyncIOMotorClient

from models.Appointment import AppointmentUpdate, RequestAnonimAppointment, RequestAppointment, Appointment, RequestNewAppointment
from utils.converter import convert_object_ids
from repositories.user_repository import UserRepository
from repositories.pet_repository import PetRepository

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client_motor = AsyncIOMotorClient(MONGO_URI)
db_motor = client_motor.get_database("pet_clinic")
appointment_collection = db_motor.get_collection("appointment")

class AppointmentRepository:
    @staticmethod
    async def get_by_id(id: str) -> Appointment:
        try:
            result = await appointment_collection.find_one({"id": id})
            return result
        except pymongo.errors.PyMongoError:
            print(f"Appointment not found: {result}")
    
    @staticmethod
    async def get_by_pet_id(id: str) -> AppointmentUpdate:
        try:
            result = await appointment_collection.find_one({"pet_id": id})
            return result
        except pymongo.errors.PyMongoError:
            print(f"Error while trying to receive appointment by pet id: {result}")
    

    @staticmethod
    async def get_pending_appointments():
        try:
            cursor = appointment_collection.find({"time_of_appointment": None})
            result = await cursor.to_list()
            return result
        except pymongo.errors.OperationFailure as e:
            print(f"Error: Failed to receive appointments: {e.message}")
            return []


    @staticmethod
    async def create_appointment(user: User, appointment: RequestNewAppointment):
        new_appointment = Appointment(
            description=appointment.description,
            user_is_registered=user.is_active, 
            pet_id=str(appointment.pet.pet_id),
            user_id=ObjectId(user.id)
        )
        appointment_dict = new_appointment.model_dump()
        
        try:
            inserted = await appointment_collection.insert_one(appointment_dict)
        except pymongo.errors.OperationFailure as e:
            print(f"Cannot insert element: {e._message}")
        return inserted
    
    @staticmethod
    async def create_anonim_appointment(user: UnregisteredUserForm, appointment: RequestNewAppointment):
        print(user)
        new_appointment = Appointment(
            description=appointment.description,
            user_is_registered=user.is_active, 
            pet_id=str(appointment.pet.pet_id),
            user_id=ObjectId(user.id)
        )
        appointment_dict = new_appointment.model_dump()
        
        try:
            inserted = await appointment_collection.insert_one(appointment_dict)
            return inserted

        except pymongo.errors.OperationFailure as e:
            print(f"Cannot insert element: {e._message}")
    
    

    async def handle_registered_appointment(user: User, appointment: RequestNewAppointment):
        """
        Handles the appointment requests for registered users.
        """
        if await AppointmentRepository.get_by_pet_id(appointment.pet.pet_id):
            raise HTTPException(status_code=400, detail="The pet already has a pending appointment.")

        await PetRepository.insert_pet(user, appointment.pet)
        created = await AppointmentRepository.create_appointment(user, appointment)
        
        if created:
            #TODO: Send email about the successful appointment request.
            return JSONResponse(status_code=201, content="Appointment created.")


    async def handle_unregistered_appointment(appointment: RequestAnonimAppointment):
        """
        Handles the appointment requests for anonim users
        """
        existing_user = await UserRepository.get_user_by_email(appointment.user.email)

        if isinstance(existing_user, User):
            raise HTTPException(status_code=400, detail="This email is already in use. Please log in!")
        
        if isinstance(existing_user, dict):  # Korábban már kért időpontot
            await PetRepository.insert_pet(existing_user, appointment.pet)
            existing_user["pets"].append(appointment.pet)
            return JSONResponse(status_code=201, content="Pet added.")
        
        else:  # Új anonim felhasználó
            user_obj = await UserRepository.create_anonim_user(appointment)

            created = await AppointmentRepository.create_anonim_appointment(user_obj, appointment)
            if created:
                return JSONResponse(status_code=201, content="Appointment created.")

    @staticmethod
    async def get_user_appointments(user: User):
        user_appointments = appointment_collection.find({"user_id": ObjectId(user.id)})
        return user_appointments

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
