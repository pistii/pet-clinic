from datetime import datetime
from typing import Annotated
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Body, Depends, HTTPException

from auth.RoleChecker import RoleChecker
from auth.auth import get_current_user

from repositories.appointment_repository import AppointmentRepository
from repositories.user_repository import UserRepository
from repositories.pet_repository import PetRepository

from models.Appointment import AppointmentRequest, AppointmentUpdate, RequestAnonimAppointment, RequestAppointment
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
        if not existing_appointment.user_is_registered:
            #TODO send email to user if anonim
            print("user is not registered, should send email...")

    elif (user.role == "user"): #User módosította az időpontot
        existing_appointment.status = "Pending..."
        existing_appointment.modified_by = user.name
        existing_appointment.last_modification = datetime.now()
        existing_appointment.time_of_appointment = None
    
    is_updated = await AppointmentRepository.update_appointment(existing_appointment)
    if is_updated.modified_count == 1:
        return JSONResponse(content="Appointment updated.", status_code=201)
    raise HTTPException("Error while updating appointment.", status_code=400)



#Default endpoint for unregistered visitors
@router.post("/create/unregistered")
async def create_appointment(appointment: RequestAnonimAppointment = Body(...)):
    user = await UserRepository.get_user_by_email(appointment.user.email)
    if isinstance(user, User): #User exist with this email
        raise HTTPException(status_code=400, detail="This email is used. Please log in and continue the appointment request in your account.")
    elif isinstance(user, dict): #User requested appointment before, insert the pet in the user pet array
        user["pets"].append(appointment.pet)
        await PetRepository.insert_pet(user, appointment.pet)
    else:
        user = await UserRepository.create_anonim_user(appointment)
        
    appointment_request = RequestAppointment(
        pet_id=appointment.pet.pet_id, 
        description=appointment.description)
    created = await AppointmentRepository.create_appointment(user, appointment_request)
    if created is not None:
        return JSONResponse(status_code=201, content="Appointment created.")


#Default endpoint for registered users
@router.post("/create")
async def create_appointment(appointment: RequestAppointment,
                             user: User = Depends(get_current_user)):
    is_exist = await AppointmentRepository.get_by_pet_id(appointment.pet_id)
    if is_exist:
        raise HTTPException(status_code=400, detail="There is a pending appointment for this pet. Please contact with your doctor.")

    created = await AppointmentRepository.create_appointment(user, appointment)
    if created is not None:
        return JSONResponse(status_code=201, content="Appointment created.")
