#Scheme to save to database

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId


class Pet(BaseModel):
    pet_id: str = Field(...)
    species: Optional[str] = Field(None)
    breed: Optional[str] = Field(None)
    name: str 
    sex: Optional[str] = None
    date_of_birth: Optional[datetime] = None


class User(BaseModel):
    id: str = Field(...)  # MongoDB _id, stringként kezeljük
    name: str = Field()
    email: EmailStr = Field()
    password: str = Field() # Titkosított jelszó bcrypt-tel
    role: str = Field()
    registration_date: datetime = Field()
    last_login: Optional[datetime] = Field(None)
    is_active: bool = Field()
    ##pets: List[Pet] = Field([])  # Alapértelmezett: üres lista


# Kérésből érkező új user (password titkosítva lesz, így plaintext fogadható)
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# Kliensnek visszaküldött user (password nélkül)
class UserResponse(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: str
    registration_date: datetime
    last_login: Optional[datetime] = None
    is_active: bool
    pets: List[Pet] = []
