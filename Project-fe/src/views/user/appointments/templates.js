import {formatDate} from '../../../helpers/helper.js'


export const renderAwaitingAppointments = (appointments_list) => {
    let template = '';
    appointments_list.map((apt, index) => {
        template += `
            <div class="card shadow-sm border-0 mb-3" id="appointment_card${index}">
                <div class="card-header d-flex justify-content-between align-items-center bg-light" id="heading${index}">
                    <div class="row container align-items-center">
                        <div class="col-2 fw-bold text-primary">
                            ${formatDate(apt.time_of_request)}
                        </div>
                        <span class="col-auto text-muted">|</span>
                        <div class="col-2 fw-bold">
                            ${formatDate(apt.time_of_appointment)}
                        </div>
                        <span class="col-auto text-muted">|</span>
                        <div class="col-2">
                            <strong class="text-secondary">${apt.pet.name}</strong>
                        </div>
                        <span class="col-auto text-muted">|</span>
                        <div class="col d-flex justify-content-end">
                            <span class="badge bg-info">${apt.status}</span>
                        </div>
                    </div>
                    <button class="btn btn-link collapsed" data-bs-toggle="collapse" data-bs-target="#item${index}" aria-expanded="false">
                        <svg class="triangle" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"></path>
                        </svg>
                    </button>
                </div>


               <div id="item${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordion">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-8 border-start ps-3">
                                <p><strong>Pet Name:</strong> ${apt.pet.name}</p>
                                <p><strong>Species:</strong> ${apt.pet.species}</p>
                                <p><strong>Breed:</strong> ${apt.pet.breed}</p>
                                <div class="p-2 bg-light border rounded">
                                    <strong>Description:</strong>
                                    <i class="bi bi-pencil-fill edit-icon text-primary ms-2" id="edit_description${index}"></i>
                                    <div id="pet_description${index}" class="d-flex justify-content-between align-items-center">
                                        <textarea class="form-control" rows="3" disabled id="description_textarea${index}">${apt.description}</textarea>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-4 d-flex justify-content-end align-items-start">
                                <button class="btn btn-danger" id="remove_appointment${index}">Remove</button>
                            </div>
                        </div>
                        ${apt.status === "Completed" ? `<div class="mt-3 p-2 bg-success text-white rounded"><strong>Diagnosis:</strong> ${apt.diagnosis || "N/A"}</div>` : ""}
                    </div>
                </div>`;
        
        document.getElementById("content").innerHTML = 
        `
        <h4>Awaiting for confirmation</h4>
        <div class="container">
            ${template}
        </div>
        <div class="py-4"></div>
        `;
    });
}

export const renderSearchBar = () => {
    const template = 
    `
    <div class="bg-dark p-2 rounded">
        <div class="mx-auto text-light">
            <div class="row container justify-content">
                
                <div class="col-auto">
                    <div class="form-group">
                        <label for="limit_field">Limit</label>
                        <input type="text" class="form-control" style="width:60px" id="limit_field" placeholder="25" min-length="1">
                    </div>
                </div>

                <div class="col-auto">
                    <div class="form-group">
                        <label for="sort_field">Sort by</label>
                        <select class="form-select" aria-label="Select value">
                            <option selected>Select...</option>
                            <option value="1">Appointment request</option>
                            <option value="2">Received appointment</option>
                            <option value="3">Last modification</option>
                        </select>
                    </div>
                </div>

                <div class="col-auto">
                    <div class="form-group">
                        <label for="date_start">Date</label>
                        <input type="date" class="form-control" id="date_start" min-length="1">
                    </div>
                </div>

                <div class="col-auto">
                    <div class="form-group">
                        <label for="date_end">Date end</label>
                        <input type="date" class="form-control" id="date_end" min-length="1">
                    </div>
                </div>

                <div class="col d-flex justify-content-end align-items-center">
                    <div>
                        <input class="btn btn-primary" type="button" onclick="filterBy()" value="Filter" />
                    </div>
                </div>

            </div>
        </div>
    </div>`
    document.getElementById("content").innerHTML += `<hr><h6>Previous appointments</h6>`
    document.getElementById("content").innerHTML += template;
}


export const renderUserAppointments = (appointments_list) => {
    let template = ''

    //Ez a címsor
    let header = 
    `<div class="card bg-secondary bg-gradient border">
        <div class="card-header d-flex justify-content-between align-items-center">
            <div class="row container">
                <div class="col-2 justify-content-center d-flex">
                    <strong>Request time</strong>
                </div>
                <span class="col-auto">|</span>

                <div class="col-2 justify-content-center d-flex align-items-center">
                    <strong>Appointment</strong>
                </div>
                <span class="col-auto p-1">|</span>

                <div class="col d-flex justify-content-end">
                    <strong>Status</strong>
                </div>
                
            </div>
        </div>
    </div>`

    template += header;


    appointments_list.map((apt, index) => {
        template += `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center" id="heading${index}">
                    <div class="row container">
                        <div class="col-2">
                            <strong>${formatDate(apt.time_of_request)}</strong>
                        </div>
                        <span class="col-auto">|</span>

                        <div class="col-2">
                        ${formatDate(apt.time_of_appointment)}
                        </div>
                        <span class="col-auto">|</span>

                        <div class="col d-flex justify-content-end">
                            <span class="badge bg-success">${apt.status}</span>
                        </div>
                        
                    </div>
                    <button class="btn btn-link collapsed" data-bs-toggle="collapse" data-bs-target="#item${index}" aria-expanded="false">
                        <svg class="triangle" width="20" height="20" viewBox="0 0 24 24">
                            <path d="M7 10l5 5 5-5z"></path>
                        </svg>
                    </button>
                </div>


                <div id="item${index}" class="collapse" aria-labelledby="heading${index}" data-parent="#accordion">
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Pet Name:</strong> ${apt.pet.name} <br>
                                <strong>Species:</strong> ${apt.pet.specie} <br>
                                <strong>Breed:</strong> ${apt.pet.breed} <br>
                            </div>
                            <div class="col-md-6">
                                <strong>Description:</strong> ${apt.description}
                                <i class="bi bi-pencil-fill edit-icon" id="#editDescription${index}"></i>
                            </div>
                        </div>
                        ${apt.status === "Completed" ? `<div><strong>Diagnosis:</strong> ${apt.diagnosis || "N/A"}</div>` : ""}
                    </div>
                </div>
            </div>`;
    });

    document.getElementById("content").innerHTML += template;
}

const setWatcher = () => {

    //Set watcher for each triangle button.
    document.querySelectorAll('.collapse').forEach((collapse) => {
        collapse.addEventListener('show.bs.collapse', function () {
            this.previousElementSibling.querySelector('.triangle').style.transform = 'rotate(180deg)';
        });

        collapse.addEventListener('hide.bs.collapse', function () {
            this.previousElementSibling.querySelector('.triangle').style.transform = 'rotate(0deg)';
        });
    });

}
