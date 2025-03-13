from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime
from Pet import Pet

class User(BaseModel):
    id: Optional[str] = Field()  # MongoDB _id, stringként kezeljük
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...) # Titkosított jelszó bcrypt-tel
    role: str = Field("user")
    registration_date: datetime = Field(datetime.now())
    last_login: Optional[datetime] = Field(None)
    is_active: bool = Field(False)
    ##pets: List[Pet] = Field([])  # Alapértelmezett: üres lista


# Kérésből érkező új user (password titkosítva lesz, így plaintext fogadható)
class UserCreate(BaseModel):
    name: str = Field(...)
    email: EmailStr = Field(...)
    password: str = Field(...)


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
