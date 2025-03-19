from datetime import datetime
from typing import Annotated
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pymongo import AsyncMongoClient, MongoClient
from fastapi import APIRouter, Depends, HTTPException

from auth.RoleChecker import RoleChecker
from auth.auth import get_current_user

from utils.converter import convert_object_ids

from repositories.appointment_repository import AppointmentRepository

from models.Appointment import AppointmentRequest, AppointmentUpdate, RequestAppointment
from models.User import User

router = APIRouter(prefix="/api/appointment", tags=["appointment"]) 


#Returns appointments in the specified date interval
@router.post("/assistant")
async def receive_assistant_appointments(appointment: AppointmentRequest, 
                                         _ : Annotated[bool, Depends(RoleChecker(required_role=["assistant", "admin"]))]
                                        ):
    date_format = '%Y-%m-%d'
    start_date = datetime.strptime(appointment.startDate, date_format)
    end_date = datetime.strptime(appointment.endDate, date_format)
    start = datetime(start_date.year, start_date.month, start_date.day, 0, 0, 0)
    end = datetime(end_date.year, end_date.month, end_date.day, 0, 0, 0)

    appointments = await AppointmentRepository.get_assistant_appointments(start, end)
    print(appointments)
    return appointments
    #return JSONResponse(content=list(appointments), status_code=200)


@router.patch("/update")
async def update_appointment(
    appointment: AppointmentUpdate,
    user: User = Depends(get_current_user)
    ):
    existing_appointment = await AppointmentRepository.get_by_id(appointment.id)
    if not existing_appointment:
        return HTTPException(status_code=404, detail="Appointment not found")
    
    if (user.role == "assistant"):
        existing_appointment.status = "Waiting for confirmation."
        existing_appointment.time_of_appointment = appointment.time_of_appointment
    elif (user.role == "user"):
        existing_appointment.status = "Pending..."
        existing_appointment.modified_by = user.name
        existing_appointment.last_modification = datetime.now()
        existing_appointment.time_of_appointment = None


    # "time_of_request": "2025-03-08T13:17:08.249+00:00",
    # "time_of_appointment": "2025-03-08T13:17:08.249+00:00",
    # "diagnosis": "null",
    # "description": "Fluffy is sick",
    # "status": "Waiting for confirmation.",
    # "modified_by": "null",
    # "last_modification": "null",



@router.post("/create")
async def create_appointment(appointment: RequestAppointment,
                             user: User = Depends(get_current_user)):
    created = await AppointmentRepository.create_appointment(user, appointment)
    if created is not None:
        return JSONResponse(status_code=201, content="Appointment created.")
