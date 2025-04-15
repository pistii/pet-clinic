import { Calendar } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import { bindFormData, datePickerFormat, formatDate } from '../../../helpers/helper';
import { renderBookedAppointmentModal, renderAvailableAppointmentModal, renderMedicalHistory, renderDiagnosisView } from './templates';

let events = [];
let data = [];

let currentForm = null;
let currentAppointment = null;

// For more interaction and resizable appointments, consider using draggable elements:
// https://fullcalendar.io/docs/event-dragging-resizing
// Demo: https://fullcalendar.io/docs/external-dragging-demo
// Dragging: https://fullcalendar.io/docs/external-dragging

////////////////// Calendar initialization
(async function initCalendar() {    
    let calendarEl = document.getElementById('calendar');

    let calendar = new Calendar(calendarEl, {
        plugins: [dayGridPlugin, timeGridPlugin, listPlugin],
        initialView: 'timeGridWeek',
        selectable: true,
        slotMinTime: "06:00:00",
        slotMaxTime: "20:00:00",
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,listWeek'
        },
        eventClick: function(info) {
            openAssignModal(info);
        },
        datesSet: async function(info) {
            let start = new Date(info.start);
            let end = new Date(info.end);   
            let obj = {
                "startDate": datePickerFormat(new Date(start)),
                "endDate": datePickerFormat(new Date(new Date().setDate(new Date(end).getDate() + 7))),
                "includePending": true
            };
            
            let resp = await fetchAppointments(obj);
            events=resp;
            data = resp;

            // Legeneráljuk a jóváhagyott eseményeket
            let confirmedAppointments = resp.confirmed.map(apt => ({
                id: apt._id,
                title: "Foglalt",
                start: new Date(apt.time_of_appointment),
                end: new Date(new Date(apt.time_of_appointment).getTime() + 30 * 60000), // 30perc //1mp = 1000ms
                backgroundColor: "gray",
                textColor: "#fff",
                editable: true,
                extendedProps: apt
                
            }))

            // Generáljuk a még elérhető eseményeket, szűrve arra hogy a létező eseményeket nem írjuk felül
            let slots = generateTimeSlots(start, (end - start) / (1000 * 60 * 60 * 24)); 
            let newEvents = slots
            .filter(slot => !confirmedAppointments.some(apt => apt.start.getTime() === slot.getTime()))
            .map(slot => ({
                id: `pending-${slot.getTime()}`,
                title: "Szabad időpont",
                start: slot,
                end: new Date(slot.getTime() + 30 * 60000),
                backgroundColor: "red",
                textColor: "#fff",
                editable: true,
                }
            ));            

            events = [...confirmedAppointments, ...newEvents]
            calendar.removeAllEvents(); // Frissítjük az eseményeket
            calendar.addEventSource([...confirmedAppointments, ...newEvents]); 
        }        
    });
    //First initialization
    calendar.addEventSource(events);
    calendar.render();
})();


function generateTimeSlots(startDay = new Date(), totalDays = 7, startHour = 6, endHour = 18, intervalMinutes = 30) {
    let slots = [];

    for (let day = 0; day < totalDays; day++) {
        let currentDay = new Date(startDay); 
        currentDay.setDate(startDay.getDate() + day); //Set up date
        currentDay.setHours(startHour, 0, 0, 0);

        while (currentDay.getHours() < endHour) {
            slots.push(new Date(currentDay)); 
            currentDay.setMinutes(currentDay.getMinutes() + intervalMinutes); // Create next appointment
        }
    }

    return slots;
}

//////////////// End of calendar initialization

function openAssignModal(info) {
    let modal = new bootstrap.Modal(document.getElementById("assignModal"));
    
    if (info.event.title == "Szabad időpont") {        
        //IMPORTANT: The displayed date and actual date can differ in different timezones.
        let start = new Date(info.event._instance.range.start);
        let end = new Date(info.event._instance.range.end);
        let userTimeZoneOffset = start.getTimezoneOffset() * 60000;

        let correctedStart = new Date(start.getTime() + userTimeZoneOffset);
        let correctedEnd = new Date(end.getTime() + userTimeZoneOffset);

        let formattedDate = correctedEnd.toLocaleDateString("en-CA", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            weekday: "long" // Teljes hétköznap név
        }).replace(/(\d{4})-(\d{2})-(\d{2})/, "$1-$2-$3");

        let formattedTime = correctedStart.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false // 24 órás formátum
        });

        let formatted = `${formattedDate} ${formattedTime}`;

        renderAvailableAppointmentModal(data.pending, formatted);        
        document.getElementById("modalTitle").innerText = "Assign Appointment"
        document.getElementById("assignBtn").addEventListener("click", () => assignAppointment(correctedStart))
    } 
    else {
        
        renderBookedAppointmentModal();

        let apt = info.event._def.extendedProps;
        currentForm = {
            id: apt._id,
            owner_name: apt.owner.name,
            email: apt.owner.email,
            pet_name: apt.owner.pet.name,
            pet_species: apt.owner.pet.species,
            pet_breed: apt.owner.pet.breed,
            pet_dob: datePickerFormat(apt.owner.pet.date_of_birth),
            radio_gender: apt.owner.pet.sex,
            description: apt.description
        }

        
        currentAppointment = apt;
        bindFormData("assignForm", currentForm);
        document.getElementById("modalTitle").innerText = "Booked Appointment"
        document.getElementById("time_of_appointment").innerText = formatDate(currentAppointment.time_of_appointment).replace("<br>", " ");
        document.getElementById("remove_appointment").addEventListener("click", () => {removeAppointmentTime(currentAppointment._id)})
        document.getElementById("updateAppointmentBtn").addEventListener("click", () => updateAppointment(currentAppointment))
    }

    setNavigationBtnWatchers();
    modal.show();
}


///////////////////// Server communication

async function fetchAppointments(json_data) {
    const response = await fetchWithAuth(`/api/appointment/assistant`, 
        {
        method: 'POST',
        data: json_data
    });

    const data = await response.json();
    return data;
}

async function assignAppointment(start) {
    const btn = document.getElementById("assignBtn");
    showLoader(true, btn);
    const activeTab = document.querySelector(".tab-pane.show.active");
    const appointmentId = activeTab?.id.replace("apt-", ""); // "apt-<id>"

    let time = formatDate(start);
    let formattedTime = time.replace("<br>", "T")
    
    let data = { 
        id: appointmentId, 
        time_of_appointment: formattedTime
    }
    
    const response = await fetchWithAuth('/api/appointment/assistant/update', {
        method: "PATCH",
        data: data
    });

    showLoader(false, btn);
    if (response.ok) {
        window.location.reload();
    }
    
}

async function removeAppointmentTime(appointmentId) {
    let data = { 
        id: appointmentId, 
        time_of_appointment: null,
        status: "Pending..."
    }

    const btn = document.getElementById("remove_appointment");
    showLoader(true, btn);
    const response = await fetchWithAuth('/api/appointment/assistant/update', {
        method: "PATCH",
        data: data
    });
    showLoader(false, btn);
    if (response.ok) {
        //const resp = await response.json();
        window.location.reload();
    }
}

async function getMedicalHistory(userId) {
    let data = await fetchWithAuth(`/api/appointment/getAll/medical-history/${userId}`);
    let json_result = await data.json();
    return json_result;
}
///////////////////// End Of server communication


///////////////////// Frontend functions

/// Watcher for view change
function setNavigationBtnWatchers() {
    console.log(currentAppointment)
    isClickedOnElement("medicalHistoryView", () => getAndRenderMedicalHistory())
    isClickedOnElement("detailsView", () => renderBookedAppointmentModalAndSetData());
    isClickedOnElement("diagnosisView", () => renderDiagnosisView(currentAppointment))
}

async function getAndRenderMedicalHistory() {
    let result = await getMedicalHistory("67de8c397169f66eafbdcc1a"); //currentAppointment.owner._id
    renderMedicalHistory(result);
}

function renderBookedAppointmentModalAndSetData() {
    renderBookedAppointmentModal();
    if (currentAppointment) {
        bindFormData("assignForm", currentForm);
        document.getElementById("modalTitle").innerText = "Booked Appointment"
        document.getElementById("time_of_appointment").innerText = formatDate(currentAppointment.time_of_appointment).replace("<br>", " ");
        document.getElementById("remove_appointment").addEventListener("click", () => {removeAppointmentTime(currentAppointment._id)})
    }
    
    document.getElementById("updateAppointmentBtn").addEventListener("click", () => updateAppointment(currentAppointment))
}


function isClickedOnElement(elementName, callback) {
    document.getElementById(elementName).addEventListener("click", callback);
}

function showLoader(show, item) {
    if (show) {
        item.disabled = true;
        item.innerHTML =
        `<div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>`
    }
    else {
        item.disabled = false;
        item.innerHTML =
        `<div class="d-flex justify-content-center">
            <div>
                <span>Send</span>
            </div>
        </div>`
    }
}

/////////////////////