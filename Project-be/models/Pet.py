import uuid
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Pet(BaseModel):
    pet_id: str = Field(...)
    species: Optional[str] = Field(None)
    breed: Optional[str] = Field(None)
    name: str = Field(...)
    sex: str = Field(..., pattern="^(male|female)$")
    date_of_birth: Optional[datetime] = Field(None)


class PetCreate(BaseModel):
    pet_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    species: Optional[str] = Field(None)
    breed: Optional[str] = Field(None)
    name: str = Field(...)
    sex: str = Field(..., pattern="^(male|female)$")
    date_of_birth: datetime = Field(None)


class PetResponse(BaseModel):
    pet_id: Optional[str] = Field(...)
    species: Optional[str] = Field()
    breed: Optional[str] = Field()
    name: Optional[str] = Field()
    sex: str = Field(..., pattern="^(male|female)$") 
    date_of_birth: datetime = Field(None)

