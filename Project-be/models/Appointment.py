from datetime import datetime
from typing import Optional
import uuid

from bson import ObjectId
from models.Pet import Pet, PetCreate
from models.User import UnregisteredUserForm, UserResponse
from pydantic import BaseModel, Field, field_validator

#Key factor: Without pet, the user cannot request an appointment


class RequestAnonimAppointment(BaseModel):
    user: UnregisteredUserForm
    pet: PetCreate
    description: str

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "user": {
                        "email": "test@pet_clinic.com",
                        "name": "Gipsz Jakab"
                    },
                    "pet": {
                        "species": "Dog",
                        "breed": "Golden Retriever",
                        "name": "Fluffy",
                        "sex": "female",
                        "date_of_birth": "2023-08-04"
                    },
                    "description": "Fluffy is feeling weak, barely ate yesterday night"
                }
            ]
        }
    }


#When user fills out the medical form
class RequestNewAppointment(BaseModel):
    pet: PetCreate
    description: str = Field(..., max_length=500)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "pet": {
                        "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                        "species": "Dog",
                        "breed": "Border Collie",
                        "name": "Fluffy",
                        "sex": "female",
                        "date_of_birth": "2023-08-04"
                    },
                    "description": "Fluffy yesterday night haven't ate. She's sleeping since then."
                }
            ]
        }
    }


#When user fills out the medical form
class RequestAppointment(BaseModel):
    pet_id: str = Field(...)
    description: str = Field(..., max_length=500)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                    "description": "My pet is not feeling well, barely ate."
                }
            ]
        }
    }


#When appointment saved into database
class Appointment(BaseModel):
    pet_id: str = Field(...)
    user_id: ObjectId = Field()
    time_of_request: datetime = Field(datetime.now())
    time_of_appointment: Optional[datetime] = Field(None)
    diagnosis: Optional[str] = Field(None, max_length=500)
    description: str = Field(..., max_length=500)
    status: Optional[str] = Field("Pending...")
    user_is_registered: bool = Field(...)
    modified_by: Optional[str] = Field(None)
    last_modification: Optional[datetime] = Field(None)
    
    #This validator converts every time the db objectId to string
    @field_validator("user_id")
    def validate_object_id(cls, v):
        if isinstance(v, str):
            return ObjectId(v)
        if isinstance(v, ObjectId):
            return v
        raise ValueError("Invalid ObjectId")

        
    model_config = {
        "arbitrary_types_allowed":"true",
        "json_schema_extra": {
            "examples": [
                {
                    "appointment_id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                    "user_id": "ObjectId('67cc433449264ff52c2793f4')",
                    "time_of_request": "2025-03-10T13:17:08.249+00:00",
                    "time_of_appointment": "2025-03-13T13:17:08.249+00:00",
                    "diagnosis": "null",
                    "description": "Fluffy is not feeling well.",
                    "status": "Pending...",
                    "user_is_registered": "true",
                    "modified_by": "null",
                    "last_modification": "null",
                }
            ]
        }
    }



#Update user appointment
class AssistantConfirmsAppointmentUpdate(BaseModel):
    id: str = Field(...)
    time_of_appointment: Optional[datetime] = Field(None)
    diagnosis: Optional[str] = Field(None, max_length=500)
    status: Optional[str] = Field("Waiting for confirmation.")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "time_of_appointment": "2025-03-14T13:17:08.249+00:00",
                    "diagnosis": "null",
                    "status": "Waiting for confirmation.",
                }
            ]
        }
    }



#When assistant confirms appointment
class AppointmentUpdate(BaseModel):
    id: str = Field(...)
    pet_id: str = Field()
    user_id: Optional[str] = Field(None)
    time_of_appointment: Optional[datetime] = Field(None)
    diagnosis: Optional[str] = Field(None, max_length=500)
    description: str = Field(..., max_length=500)
    status: Optional[str] = Field("Waiting for confirmation.")
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "appointment_id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                    "user_id": "67cc433449264ff52c2793f4",
                    "time_of_appointment": "2025-03-14T13:17:08.249+00:00",
                    "diagnosis": "null",
                    "description": "Fluffy is sick",
                    "status": "Waiting for confirmation.",
                }
            ]
        }
    }


#When USER request the appointments. This is the response model
class UserAppointmentResponse(BaseModel):
    appointment_id: str = Field(...)
    time_of_request: datetime = Field(None)
    time_of_appointment: datetime = Field(None)
    description: str = Field(...)
    status: str = Field()
    diagnosis: str = Field(None, max_length=500)
    last_modification: Optional[datetime] = Field(None)
    modified_by: Optional[str] = Field(None)
    pet: Pet = Field(...) 


#When ASSISTANT OR ADMIN request the appointments. This is the response model
class AssistantAppointmentResponse(UserAppointmentResponse):
    user: UserResponse = Field(...)    

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "appointment_id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "time_of_request": "2025-03-08T13:17:08.249+00:00",
                    "time_of_appointment": "2025-03-08T13:17:08.249+00:00",
                    "diagnosis": "null",
                    "description": "Fluffy is sick",
                    "status": "Pending...",
                    "modified_by": "null",
                    "last_modification": "null",
                    "pet": {
                        "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                        "species": "Dog",
                        "breed": "Border Collie",
                        "name": "Fluffy",
                        "sex": "female",
                        "date_of_birth": "2023-08-04"
                    },
                    "user": {
                        "id": "67cc433449264ff52c2793f4",
                        "name": "Gipsz Jakab",
                        "email": "user@petclinic.com",
                        "role": "user",
                        "registration_date": "2025-03-08T14:16:36.751+00:00",
                        "last_login": "2025-03-08T17:13:51.179+00:00",
                        "is_active": "false"
                    }
                }
            ]
        }
    }

class AppointmentRequest(BaseModel):
    startDate: str
    endDate: str
    includePending: bool = False