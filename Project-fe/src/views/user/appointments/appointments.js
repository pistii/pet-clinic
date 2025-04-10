import {renderAwaitingAppointments, renderSearchBar, renderUserAppointments } from './templates.js'

var non_awaiting = [];
var awaiting = [];

(async function init() {
  let resp = await fetchData();
  if (resp.length > 0) {
    resp.forEach(element => {
      element.pet.breed = element.pet.breed == null || element.pet.breed == undefined ? "N/A" : element.pet.breed
      element.pet.species = element.pet.species == null || element.pet.species == undefined ? "N/A" : element.pet.species
      element.pet.date_of_birth = element.pet.date_of_birth == null || element.date_of_birth == undefined ? "N/A" : element.date_of_birth
      element.sex = element.sex == null || element.sex == undefined ? "N/A" : element.sex
    });

    let awaiting_arr = resp.filter(element => element.status.toLowerCase().includes("pending"));
    let nonAwaiting = resp.filter(element => !element.status.toLowerCase().includes("pending"));
    
    non_awaiting = nonAwaiting;
    awaiting = awaiting_arr;
  }
  renderUI();
})()

//The view template without non_awaiting bindings
function renderUI() {
  if (awaiting.length > 0) {
    renderAwaitingAppointments(awaiting);

    for (let index = 0; index < awaiting.length; index++) {
      const element = awaiting[index];
      document.getElementById("edit_description"+index).addEventListener("click", () => {editDescription(element, index)})
      document.getElementById("remove_appointment"+index).addEventListener("click", () => {delAppointment(element._id, index)});      
    }
  }

  else if (non_awaiting.length > 0) {
    renderSearchBar();  
    console.log(non_awaiting)
    renderUserAppointments(non_awaiting);
  }
  
}


///////////// Server communication functions
async function fetchData() {
  let response = await fetchWithAuth(`/api/appointment/getAll`)

  if (response.status == 404) {
    document.getElementById("content").innerHTML = "<div class='d-flex justify-content-center'><h3>No appointments yet.</h3></div>"
  }
  else if (response.status === 200) {
    return await response.json();
  }
  else {
    document.getElementById("content").innerHTML = "<span class='text-danger'>Failed to get appointments.</span>"
  }
}


async function editDescription(appointment_obj, index) {
  let isModify = document.querySelector("#edit_description"+index).classList.contains("bi-check-circle-fill");
  let textarea = document.getElementById("description_textarea"+index);
  let textarea_query = document.querySelector("#edit_description" + index);
  if (!isModify) {
    textarea.disabled=false;
    textarea_query.classList.remove("bi-pencil-fill")
    textarea_query.classList.add("bi-check-circle-fill")
  }
  else {
    textarea.disabled=true;
    textarea_query.classList.remove("bi-check-circle-fill")
    textarea_query.classList.add("bi-pencil-fill")

    let update_data = {
      "id": appointment_obj._id,
      "pet_id": appointment_obj.pet.pet_id,
      "description": textarea.value
    }
    await updateAppointment(update_data);
  }
}

async function updateAppointment(appointment) {
  let response;
  try {
    response = await fetchWithAuth(`/api/appointment/update`, {
      method: 'PATCH',
      data: appointment
    });

    console.log(response)
  }
  catch (error) {
    console.log(error)
    var resp_json = await response.json();
    document.getElementById("content").innerHTML = 
    `
    <div class="d-flex justify-content-center">
      <span class='text-danger'>Unexpected error while deleting appointment.</span>
      <span class="text-danger">${JSON.stringify(resp_json)}</span>
    </div>
    `
  }

}

async function delAppointment(id, item_index) {
  let response;
  try {
    response = await fetchWithAuth(`/api/appointment/delete/${id}`, {
      method: 'DELETE'
    })
  }
  catch (error) {
    document.getElementById("content").innerHTML = 
    `
    <div class="d-flex justify-content-center">
      <span class='text-danger'>Unexpected error while deleting appointment.</span>
      <span class="text-danger">${JSON.stringify(resp_json)}</span>
    </div>
    `
  }


  if (!response.ok) {
    let resp_json = await response.json();

    document.getElementById("content").innerHTML = 
    `
    <div class="d-flex justify-content-center">
      <span class='text-danger'>Unexpected error while deleting appointment.</span>
    </div>
    `
    if (typeof(resp_json) == String) {
      document.getElementById("content").innerHTML += `<span class="text-danger">${JSON.stringify(resp_json)}</span>`
    }

  }
  else {
    //Remove item from DOM
    let index = awaiting.findIndex(p => p._id == id)
    awaiting.splice(index, 1)
    document.getElementById('appointment_card'+item_index).innerHTML = ''
  }
}

/////////////