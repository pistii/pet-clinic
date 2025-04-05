from datetime import datetime
import json
from typing import Annotated, Optional, Union
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Body, Depends, HTTPException
import pymongo

from auth.RoleChecker import RoleChecker
from auth.auth import get_current_user, get_optional_user

from repositories.appointment_repository import AppointmentRepository
from repositories.user_repository import UserRepository

from models.Appointment import Appointment, AppointmentRequest, AppointmentUpdate, AssistantConfirmsAppointmentUpdate, RequestAnonimAppointment, RequestNewAppointment
from models.User import User

from utils.converter import convert_document

router = APIRouter(prefix="/api/appointment", tags=["appointment"]) 

@router.get("/getAll")
async def get_user_appointments(user: Annotated[User, Depends(get_current_user)]):
    appointments = await AppointmentRepository.get_user_appointments(user)
    if len(appointments) > 0:
        convert_json = [convert_document(item) for item in appointments]
        return JSONResponse(content=convert_json, status_code=200)
    return JSONResponse(content=[], status_code=404)



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

    appointment_obj = {"pending": [],
                       "confirmed": []
                       }

    approved_appointments = await AppointmentRepository.get_assistant_appointments(start, end)
    print(approved_appointments)

    if appointment.includePending:
        pending_appointments = await AppointmentRepository.get_pending_appointments()
        appointment_obj["pending"] = convert_document(pending_appointments)

    appointment_obj["confirmed"] = approved_appointments

    print(appointment_obj)
    return appointment_obj
    #return JSONResponse(content=list(appointments), status_code=200)


@router.patch("/assistant/update")
async def update_appointment(
    appointment: AssistantConfirmsAppointmentUpdate,
    _ : Annotated[bool, Depends(RoleChecker(required_role=["assistant", "admin"]))],
    ):
    existing_appointment = await AppointmentRepository.get_by_id(appointment.id)

    if not existing_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    if not existing_appointment.user_is_registered:
        #TODO send email to user if anonim
        print("user is not registered, should send email...")

    try:
        is_updated = await AppointmentRepository.update_appointment(appointment)
        if is_updated is True:
            return JSONResponse(content="Update successful.", status_code=200)
        else:
            return JSONResponse(content="Update failed. Check fields, maybe if no changes happened.", status_code=400)
    except pymongo.errors.PyMongoError:
        raise HTTPException(detail="Error while updating appointment.", status_code=400)


@router.patch("/update")
async def update_appointment(
    appointment: AppointmentUpdate,
    user: User = Depends(get_current_user)
    ):
    
    existing_appointment = await AppointmentRepository.get_by_id(appointment.id)
    copy=existing_appointment

    if not existing_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    if user.role == "assistant" or user.role=="admin":
        copy["status"] = "Appointment received."
        copy["time_of_appointment"] = appointment.time_of_appointment
        if not copy["user_is_registered"]:
            #TODO send email to user if anonim
            print("user is not registered, should send email...")

    elif user.role == "user": #User módosította az időpontot
        existing_appointment["status"] = "Pending..."
        existing_appointment["modified_by"] = user.name
        existing_appointment["last_modification"] = datetime.now()
        existing_appointment["time_of_appointment"] = None
        existing_appointment["description"] = appointment.description
        #TODO: Újra értesíteni kell az assistantot
    
    obj = json.loads(json.dumps(convert_document(existing_appointment)))

    is_updated = await AppointmentRepository.update_appointment(copy)
    if is_updated is None:
        return JSONResponse(content="No changes.", status_code=200)
    if isinstance(is_updated, dict):
        return JSONResponse(content="Appointment updated.", status_code=201)
    raise HTTPException("Error while updating appointment.", status_code=400)


@router.post("/create")
async def create_appointment(
    appointment: Union[RequestNewAppointment, RequestAnonimAppointment],
    user: Optional[User] = Depends(get_optional_user)):
        if user is None:
            #If not logged in, we will treat it as an anonymous appointment request.
            appointments = await AppointmentRepository.handle_unregistered_appointment(appointment)
            return appointments    
        # If logged in, we request a normal appointment request.
        appointments = await AppointmentRepository.handle_registered_appointment(user, appointment)
        return appointments


@router.delete("/delete/{appointment_id}")
async def delete_appointment(appointment_id: str,
                             user: User = Depends(get_current_user)):
    user_appointments = await AppointmentRepository.get_user_appointments(user)

    if len(user_appointments) == 0:
        return None
    
    #Szűrés az időpontra ha van létező adat akkor visszaadja, különben None értéket kap.
    appointment_found = next((x for x in user_appointments if str(x["_id"]) == appointment_id), None)
    if appointment_found is None:
        raise HTTPException(status_code=404, detail="Appointment not found.")
    
    await AppointmentRepository.delete_appointment(appointment_id=appointment_id)
    return JSONResponse(status_code=200, content="Appointment deleted.")