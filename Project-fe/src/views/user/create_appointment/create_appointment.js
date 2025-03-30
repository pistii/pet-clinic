import { fillExtendedAppointmentForm, fillRegisteredUserAppointmentForm, selectPetOrfillFormView } from "./appointment_forms";
import { formatDate } from '../../../helpers/helper'

const user_details = JSON.parse(localStorage.getItem("user_details"))
const current_role = user_details ? user_details.role : null;
let user_pets = [];

(async function init() {
    if (current_role) { //Ha be van jelentkezve, lekérjük a kisállatokat...
        await fetchData().then(
            () => {
                if (user_pets.length > 0) {
                    selectPetOrfillFormView();
                    initializeSelectForm(); //The pet selector

                    document.getElementById("fillOutForm").addEventListener("click", () => {
                        fillRegisteredUserAppointmentForm();
                        setWatchers();
                    })
                } 
                else {
                    fillRegisteredUserAppointmentForm();
                    setWatchers();
                }
            }
        );   
    }
    else { //If visitor, display the form instantly and set watcher for the submit.
        fillExtendedAppointmentForm(); //Display form with name and email
        setWatchers();
    }
})()



/////////Start of Server communication

//Receive all pet for user
async function fetchData() {
    try{
        let server_response = await fetch(`${SERVER_URL}/api/pets/getAll`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem("access_token")}`
            }
        }) 

        let json_pet_list = await server_response.json();
        user_pets = json_pet_list;

    } catch (error) { 
        document.getElementById("content").innerHTML = `<div class="d-flex justify-content-center"><span class='text-danger'>404 Failed to request data.</span></div>`
    }
}

async function postAppointmentRequest() {
    let form = document.getElementById("appointmentForm");
    //Prepare data...
    let pet_name = form.petname.value;
    let dob = form.dob.value;
    let species = form.species.value;
    let breed = form.breed.value;
    let description = form.description.value;

    let selectedGender = document.querySelector('input[name="radio_gender"]:checked');
    let sex = selectedGender ? selectedGender.value : null;
    
    const token = localStorage.getItem("access_token");

    const header = new Headers();
    header.append('Content-Type', 'application/json');

    let json_body = {
        "pet": {
            "name": pet_name,
            "date_of_birth": dob || null,
            "species": species,
            "breed": breed,
            "sex": sex,

        },
        "description": description
    }
    

    if (!current_role) {
        let name = form.name.value;
        let email = form.email.value;
        json_body['user'] = {
            "email": email,
            "name": name
        }

        //console.log(json_body)
    }
    else {
        header.append('Authorization', `Bearer ${token}`)
    }

    let request;
    try {
        request = await fetch(`${SERVER_URL}/api/appointment/create`, {
            method: "POST",
            headers: header,
            body: JSON.stringify(json_body)
        });
    }
    catch (error) {
        showErrorMsg(error);
    }

    //console.log(json_resp);   
    if (request.status === 200 || request.status === 201) {
        appointmentSuccess();
    }
    else if (request.status === 400 || request.status === 404) {
        let error_msg = await request.json();
        showErrorMsg(error_msg);
    }
    else {
        showErrorMsg("Unexpected error. Appointment request failed.");
    }
};
/////////End of server communication


//Inserts pets into the selector, if user is logged in and has any pet
function initializeSelectForm() {
    if (user_pets.length > 0) {
        user_pets.forEach(pet => {
            document.getElementById("petSelector").innerHTML += `<option value="${pet.pet_id}">${pet.name}</option>`            
        });


    const watchPetChange = () => {
        const selectedPet = document.getElementById("petSelector");
        //If pet selected, 
        selectedPet.addEventListener("change", () => {
            let pet_id = selectedPet.value;
            let pet = user_pets.find(p => p.pet_id == pet_id);
            
            fillRegisteredUserAppointmentForm();
            setWatchers(); //Set watcher for the submit press

            //Feltölti a formot a létező pet értékeivel
            let form = document.getElementById("appointmentForm");
            setFormValues(form, pet);
            
            //Beállítjük az inputokat hogy ne legyen módosítható
            form.petname.disabled = true;
            form.dob.disabled = true;
            form.species.disabled = true;
            form.breed.disabled = true;
            form.radio_male.disabled = true;
            form.radio_female.disabled = true;
        }
    )}

    watchPetChange();

    }
}

/////////Setters
function setWatchers() {    
    console.log("setwatcher")
    document.getElementById("submit").addEventListener("click", validateForm);
}

function setFormValues(form, pet) {
    let pet_date = new Date(pet.date_of_birth);
    let dd = String(pet_date.getDate()).padStart(2, '0');
    let mm = String(pet_date.getMonth() + 1).padStart(2, '0');
    let yyyy = pet_date.getFullYear();
    let date_format =  yyyy + '-' + mm + '-' + dd;

    form.petname.value = pet.name;
    form.dob.value = date_format;
    form.species.value = pet.species;
    form.breed.value = pet.breed;
    form.radio_gender.value = pet.sex;
}

/////////End of setters


/////////Validator
function validateForm() {
    showLoader(true);

    let forms = document.querySelectorAll('.needs-validation');
    
    forms.forEach(form => {
        form.classList.add("was-validated");

        let invalidFields = form.querySelectorAll(":invalid"); 

        if (invalidFields.length > 0) {
            //console.log("Van érvénytelen mező!");
            //Esetleges későbbi értesítésekhez vagy további validáció ellenőrzéséhez még jól jöhet
        } else {
            //console.log("Minden mező érvényes!");
            const appointment_form = document.getElementById("appointmentForm");
            
            if (appointment_form.description.value.length < 50) {
                let shouldProceed = confirm("Description looks short on text. Are you sure you write down everything important?")
                if (shouldProceed) {
                    postAppointmentRequest();
                }
                return;
            }
            postAppointmentRequest();
        }
    });

    showLoader(false);
}



/////////Design and frontend functions
function showLoader(show) {
    const btn = document.getElementById("submit");
    if (show) {
        btn.disabled = true;
        btn.innerHTML =
        `<div class="d-flex justify-content-center">
            <div class="spinner-border" role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>`
    }
    else {
        btn.disabled = false;
        btn.innerHTML =
        `<div class="d-flex justify-content-center">
            <div>
                <span>Send</span>
            </div>
        </div>`
    }
}


const showErrorMsg = (msg) => {
    document.getElementById("informField").innerHTML = `<span class="text-danger">${msg}</span>`
}

const appointmentSuccess = () => {
    document.getElementById("content").innerHTML = 
        `<div class="card container">
            <div class="justify-content-center">
                <div class="justify-content-center d-flex">
                    <i class="bi-check-circle-fill" style="font-size:64px; color: green"></i>
                </div>
                <h2>Appointment request success.</h2>
                <hr>
                <h6>Please be patient, we will notify you as soon as possible.</h6>
                <h6>If you requested appointment without registration, we will inform you in email.</h6>
            </div>
        </div>`
}

/////////End of design and frontend functions