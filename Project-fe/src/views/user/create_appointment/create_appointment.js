
//TODO: tesztelésre vár.
async function sendAppointment() {
    let form = document.getElementById("appointmentForm");

    let name = form.name.value;
    let email = form.email.value;
    let pet_name = form.pet-name.value;
    let dob = form.dob.value;
    let species = form.species.value;
    let description = form.description.value;

    let response = await fetch(`${SERVER_URL}/api/appointments/new`, {
        method: "POST",
        body: JSON.stringify({
            "user": {
                "name": name,
                "email": email,
            },
            "pet": {
                "name": pet_name,
                "date_of_birth": dob,
                "species": species,
                "description": description
            }
        })
    });

    let json_resp = response.json();

    console.log(json_resp);
}