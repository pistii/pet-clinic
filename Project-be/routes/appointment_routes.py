from datetime import datetime
from typing import Annotated, Optional, Union
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Body, Depends, HTTPException

from auth.RoleChecker import RoleChecker
from auth.auth import get_current_user, get_optional_user

from repositories.appointment_repository import AppointmentRepository

from models.Appointment import AppointmentRequest, AppointmentUpdate, RequestAnonimAppointment, RequestNewAppointment
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



@router.get("/get/pending")
async def get_pending_appointments(_: Annotated[bool, Depends(RoleChecker(required_role=["assistant", "admin"]))]):
    result = await AppointmentRepository.get_pending_appointments()
    
    if not result:
        return JSONResponse(content="Appointment not found", status_code=404)

    json_data = [convert_document(doc) for doc in result]
    return JSONResponse(content=json_data, status_code=200)


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