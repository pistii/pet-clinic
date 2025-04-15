import { formatDate } from "../../../helpers/helper"
export const renderBookedAppointmentModal = () => {
    document.getElementById("modalContent").innerHTML = 
    `
<form id="assignForm">

    <div>
        <label for="description" class="form-label">Description</label>
        <textarea class="form-control" rows="3" id="description"></textarea>
    </div>

    <div class="mb-3">
        <div>
            <span class="form-label">Time Of Appointment:</span>
            <strong class="text-primary" id="time_of_appointment"></strong>
            <button type="button" class="mr-3 btn btn-secondary" id="remove_appointment">Remove</button>
        </div>
    </div>
    <hr>

    <div>Owner Details</div>
    <div class="mb-3">
        <label for="owner_name" class="form-label">Name:</label>
        <input type="text" class="form-control" id="owner_name" disabled>
    </div>
    <div class="mb-3">
        <label for="email" class="form-label">Email:</label>
        <input type="email" class="form-control" id="email" disabled autocomplete="off">
    </div>

    <hr>
    <div>Pet Details</div>
    <div class="mb-3">
        <label for="pet_name" class="form-label">Name:</label>
        <input type="text" class="form-control" id="pet_name">
    </div>
    <div class="mb-3">
        <label for="pet_species" class="form-label">Species:</label>
        <input type="text" class="form-control" id="pet_species">
    </div>
    <div class="mb-3">
        <label for="pet_breed" class="form-label">Breed:</label>
        <input type="text" class="form-control" id="pet_breed">
    </div>
    <div class="mb-3">
        <label for="pet_dob" class="form-label">Date Of Birth:</label>
        <input type="date" class="form-control" id="pet_dob">
    </div>
    <div class="mb-3">
        <label for="radio_female" class="form-label">Sex:</label>
        <div class="ms-2" id="pet_radio">
            <div class="form-check form-group ">
                <input class="form-check-input" type="radio" name="radio_gender" id="radio_female" value="female">
                <label class="form-check-label" for="radio_female">
                    female
                </label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="radio" name="radio_gender" id="radio_male" value="male">
                <label class="form-check-label" for="radio_male">
                    male
                </label>
            </div>
        </div>
    </div>

    </div>
    <div id="appointmentId"></div>
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn btn-primary" id="updateAppointmentBtn">Save changes</button>
    </div>
</form>
`
}


export const renderAvailableAppointmentModal = (users, selectedTime) => {
    console.log(users.length)

    const noNewAppointment = users.length == 0;
    console.log(noNewAppointment)
    document.getElementById("modalContent").innerHTML = `
    <div class="row">
        ${noNewAppointment ? 
            `<div class="d-flex justify-items-center justify-content-center">
                <div>No new appointment request.</div>
            </div>` : 
        
            ` <!--Aposztrof kezdete--><div>
        <span>Appointment: <b>${selectedTime}</b> </span>

        </div>
        <!-- Oldalsó lista a tabokhoz -->
        <div class="col-4" style="overflow-y: scroll; max-height:400px">
            <div class="list-group p-0 m-0" id="list-tab" role="tablist">
                ${users.map((apt, index) => `
                <a class="list-group-item list-group-item-action ${index === 0 ? "active" : ""} m-0" 
                    id="list-${apt._id}-list" 
                    data-bs-toggle="list" href="#apt-${apt._id}" 
                    role="tab" aria-controls="apt-${apt._id}">
                    ${apt.owner.name}
                </a>
                `).join("")}
            </div>
        </div>

        <!-- Tab tartalom -->
        <div class="col-8">
            <div class="tab-content" id="nav-tabContent">
                ${users.map((apt, index) => `
                <div class="tab-pane fade ${index === 0 ? "show active" : ""}" 
                    id="apt-${apt._id}" role="tabpanel" aria-labelledby="list-${apt._id}-list">
                    <form id="pet_form">
                        <label for="description-${index}">Description</label>
                        <textarea disabled rows="3" id="description-${index}" style="width: 100%">${apt.description}</textarea>
                        <hr>
                        <div>Pet Details</div>
                        <div class="mb-3">
                            <label for="pet_name-${index}" class="form-label">Name:</label>
                            <input type="text" class="form-control" id="pet_name-${index}" value="${apt.pet.name}" disabled>
                        </div>
                        <div class="mb-3">
                            <label for="pet_species-${index}" class="form-label">Species:</label>
                            <input type="text" class="form-control" id="pet_species-${index}" value="${apt.pet.species}" disabled>
                        </div>
                        <div class="mb-3">
                            <label for="pet_breed-${index}" class="form-label">Breed:</label>
                            <input type="text" class="form-control" id="pet_breed-${index}" value="${apt.pet.breed}" disabled>
                        </div>
                        <div id="obj_id-${index}" class="hidden p-0 m-0" style="height:0px; width: 0px; overflow: hidden">${apt._id}</div>
                    </form>
                </div>
                `).join("")}
            </div>
        </div>
        `}
    </div>

    <!-- Modal lábléc -->
    <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="submit" class="btn btn-primary" id="assignBtn" ${noNewAppointment ? 'disabled' : ''}>Assign Appointment</button>
    </div>
    `;
}

export function renderMedicalHistory(dataList) {
        const container = document.getElementById("modalContent");
        container.innerHTML = ""; // Törlés
    
        if (!dataList || dataList.length === 0) {
            container.innerHTML = "<p class='text-muted'>No previous records.</p>";
            return;
        }
    
        dataList.forEach(entry => {
            const date = formatDate(entry.time_of_appointment);
            const pet = entry.pet || {};
    
            const html = `
                <div class="p-3 border-bottom border-primary-subtle">
                    <h5 class="mb-2 text-primary">${date}</h5>
    
                    <div class="mb-2">
                        <strong>Pet name:</strong> ${pet.name || "-"}<br>
                        <strong>Specie:</strong> ${pet.species || "-"}<br>
                        <strong>Breed:</strong> ${pet.breed || "-"}
                    </div>
    
                    <div class="mb-2">
                        <strong>Description:</strong><br>
                        ${entry.description ? entry.description : "<em>Not set</em>"}
                    </div>
    
                    <div class="mb-1">
                        <strong>Diagnosis:</strong><br>
                        ${entry.diagnosis ? entry.diagnosis : "<em>No diagnosis</em>"}
                    </div>
                </div>
            `;
    
            container.insertAdjacentHTML("beforeend", html);
        });
    }


export function renderDiagnosisView(appointment) {
        const container = document.getElementById("modalContent");
        container.innerHTML = "";
        console.log(appointment)

        const ownerName = appointment?.owner.name || "Tulajdonos neve nem elérhető";
        const petName = appointment?.owner.pet?.name || "Állat neve nem elérhető";
        const diagnosisText = appointment?.diagnosis || "";
    
        const html = `
            <div class="mb-3">
                <h5 class="mb-1"><strong>Tulajdonos:</strong> ${ownerName}</h5>
                <h6 class="text-muted"><strong>Állat neve:</strong> ${petName}</h6>
            </div>
    
            <div class="mb-4">
                <label for="diagnosisTextarea" class="form-label"><strong>Diagnózis</strong></label>
                <textarea class="form-control" id="diagnosisTextarea" rows="8">${diagnosisText}</textarea>
            </div>
    
            <div class="d-flex justify-content-end">
                <button class="btn btn-success" id="saveDiagnosisBtn">
                    <i class="bi bi-check-circle me-1"></i> Mentés
                </button>
            </div>
        `;
    
        container.innerHTML = html;
    
        document.getElementById("saveDiagnosisBtn").addEventListener("click", () => {
            const newDiagnosis = document.getElementById("diagnosisTextarea").value;
            saveDiagnosis(appointment.id, newDiagnosis);
            
        });
    }
    