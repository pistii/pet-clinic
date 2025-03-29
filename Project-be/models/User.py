from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from models.Pet import Pet, PetCreate

class User(BaseModel):
    id: str = Field(..., alias="_id")  # MongoDB _id, stringként kezeljük
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...) # Titkosított jelszó bcrypt-tel
    role: str = Field("user")
    registration_date: datetime = Field(datetime.now())
    last_login: Optional[datetime] = Field(None)
    is_active: bool = Field(False)
    pets: List[Pet] = Field([])  # Alapértelmezett: üres lista


# Kérésből érkező új user (password titkosítva lesz, így plaintext fogadható)
class UserCreate(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)

# A módosítandó user model
class UpdateUser(BaseModel):
    id: str = Field(...)
    name: Optional[str] = Field()
    email: Optional[EmailStr] = Field()
    password: Optional[str] = Field(default=None)


# Kliensnek visszaküldött user (password nélkül)
class UserResponse(BaseModel):
    id: Optional[str] = Field(None)
    name: str = Field(...)
    email: EmailStr = Field(...)
    role: Optional[str] = Field("user")
    registration_date: Optional[datetime] = Field(None)
    last_login: Optional[datetime] = Field(None)
    is_active: bool = Field(True)
    pets: List[Pet] = Field([])


class UnregisteredUserForm(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    role: Optional[str] = Field("anonim")
    is_active: bool = Field(False)
    pets: List[PetCreate] = Field([])