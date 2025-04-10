var initial_data = null;
/////////////Initialization method
(async function init() {
    let data = await fetchUser();
    initial_data = data;
    parseUserDetailsInForm();
    setWatcher();
})()


function parseUserDetailsInForm() {
    let form = document.getElementById("detailsForm");
    form.username.value = initial_data.name;
    form.email.value = initial_data.email;
}


//////////// Setters
function setWatcher() {
    document.getElementById("submit").addEventListener("click", (event) => validate(event))
    document.getElementById("delete-btn").addEventListener("click", deleteUser)
}

//////////// End of Setters


//////////// Server communication methods

async function fetchUser() {

    let response = await fetchWithAuth(`/api/users/getUser`);

    let resp_json = await response.json();
    return resp_json;
}


async function update() {
    let name = document.getElementById("username").value;
    let password = document.getElementById("password").value;
    let password1 = document.getElementById("password1").value;
    let email = document.getElementById("email").value;

    let json_obj = {
        "id": initial_data.id,
        "email": email,
        "name": name
    }

    //Korábban már volt validáció, itt már csak ellenőrzöm hogy egyeznek-e 
    if (password !== null && password1 !== null && password == password1) {
        json_obj["password"] = password
    }

    let response = await fetchWithAuth(`/api/users/update`, {
        method: 'PUT',
        data: json_obj
    });

    if (response.ok) {
        console.log("updated");
    }
    return response;

}

async function deleteUser() {
    let user_id = initial_data.id;
    
    let response = await fetchWithAuth(`/api/users/delete/${user_id}`, {
        method: 'DELETE'
    });

    if (response){
        let json_resp = await response.json();
        if (response.status == 400 || response.status == 404) {
            if (json_resp.detail) {
                document.getElementById("informField").innerHTML = `<span class="text-danger">${json_resp.detail}</span>`
            }
            else {
                document.getElementById("informField").innerHTML = `<span class="text-danger">Failed to delete.</span>`
            }
        }
        if (response.status == 200) {
            localStorage.clear();
            window.location.href = '/';
        }
    }
    console.log(response.ok)

}
//////////// End of Server communication



//////////// Validator functions
async function validate(e) {
    e.preventDefault();
    const detailsForm = document.getElementById("detailsForm");
    let email = detailsForm.email.value;
    let name =  detailsForm.username.value;

    //Returns true if password is longer than 8 character, and the two field matches, 
    // or the inputs are not filled.
    // Otherwise false
    let passwordIsValid = validatePassword(detailsForm);
    
    //Iterate the email and username input fields and validate
    var forms = document.querySelectorAll('.validate')
    forms.forEach(form => {
        form.classList.add("was-validated");
    });

    // console.log(passwordIsValid)
    // console.log("initial_data" + JSON.stringify(initial_data))
    // console.log("email" + email !== initial_data.email + "|" + email)
    // console.log("name" + name !== initial_data.name + "|" + name)

    if (passwordIsValid || (email !== initial_data.email || name !== initial_data.name)) {
        //Validation was successful proceed to data sending.
        let resp = await update();

        let resp_json = await resp.json();
        if (email !== initial_data.email) { //Email changed, update access token
            if (resp_json) {
                if (resp_json.access_token !== null && resp_json.access_token !== undefined) {
                    localStorage.setItem("access_token", resp_json.access_token);
                }
            }
            else { //This is a fallback in case the access token isn't available or couldn't read it from the response
                localStorage.clear();
                window.location.href = "/";
            }
        }
        else if (name !== initial_data.name) {
            let saved_data = JSON.parse(localStorage.getItem("user_details"));
            saved_data.name = name;
            localStorage.setItem("user_details", JSON.stringify(saved_data))
        }
    }
}

function validatePassword(form) {
    const setInvalid = () => {
        form.password.classList.add("is-invalid");
        form.password1.classList.add("is-invalid");
    }

    const setValid = () => {
        form.password.classList.add("is-valid");
        form.password1.classList.add("is-valid");
    }

    let password1 = form.password.value;
    let password2 = form.password1.value;

    if (password1 && password2 !== null) {        
        form.password.classList.remove("is-invalid");
        form.password.classList.remove("is-valid");
        form.password1.classList.remove("is-invalid");
        form.password1.classList.remove("is-valid");

        if (password1 !== password2) {
            setInvalid();
            document.getElementById("passwordErrorField").innerText = "Password doesn't match";
            return false;
        }
        else if (password2.length < 8) {
            setInvalid();
            document.getElementById("passwordErrorField").innerText = "Password length too short"
            return false;
        }
        else {
            setValid();
            return true;
        }
    } 
    return true;
}
//////////// End of validator