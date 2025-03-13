from datetime import datetime
from typing import Optional
from Pet import Pet
from User import UserResponse
from pydantic import BaseModel, Field

#Key factor: Without pet, the user cannot request an appointment

#When user fills out the medical form
class RequestAppointment(BaseModel):
    appointment_id: str = Field(...)
    pet_id: str = Field(...)
    description: str = Field(..., max_length=500)

    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "appointment_id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                    "description": "Fluffy is sick"
                }
            ]
        }
    }


#When appointment saved into database
class Appointment(BaseModel):
    appointment_id: Optional[str] = Field()
    pet_id: str = Field(...)
    user_id: str = Field(...)
    time_of_request: datetime = Field(datetime.now())
    time_of_appointment: datetime = Field(None)
    diagnosis: Optional[str] = Field(None, max_length=500)
    description: str = Field(..., max_length=500)
    status: Optional[str] = Field("Pending...")
    modified_by: Optional[str] = Field(None)
    last_modification: Optional[datetime] = Field(None)
    
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "appointment_id": "ef6b7edb-2073-412f-8de9-f2c6df858556",
                    "pet_id": "1c9b9b2f-3cb7-4c53-81a8-26436a71a7ab",
                    "user_id": "67cc433449264ff52c2793f4",
                    "time_of_request": "2025-03-08T13:17:08.249+00:00",
                    "time_of_appointment": "2025-03-08T13:17:08.249+00:00",
                    "diagnosis": "null",
                    "description": "Fluffy is sick",
                    "status": "Pending...",
                    "modified_by": "null",
                    "last_modification": "null",
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