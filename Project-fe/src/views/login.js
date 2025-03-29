document.getElementById("loginBtn").addEventListener("click", loginBtnPress)

        
async function loginBtnPress(event) {
    event.preventDefault();
    let form = document.getElementById("form");
    let email = form.email.value;
    let password = form.password.value;

    
    //Sends a login request to the server
    let isSuccess = await login(email, password);
    
    if(isSuccess) {
        //get the user details with the access token
        let token = localStorage.getItem("access_token") 
        await getUserData(token);
        window.location.href = '/appointments';
    }
}

async function login(email, password) {
    let formdata = new FormData();
    formdata.append("username", email);
    formdata.append("password", password);

    let json_resp = null;
    try {
        const response = await fetch(`${SERVER_URL}/api/users/login`, {
            method: "POST",
            body: formdata
        });
        json_resp = await response.json();

        if (response.ok && json_resp) {
            localStorage.setItem("access_token", json_resp.access_token);
            localStorage.setItem("refresh_token", json_resp.refresh_token);
            return true;
        }
        else if (!response.ok) {
            if (json_resp.detail == "Incorrect username or password") {
                document.getElementById("informField").innerHTML = `<span class="text-danger">Incorrect email or password.</span>`
            }
            else {
                document.getElementById("informField").innerHTML = `<span class="text-danger">Failed to login.</span>`
            }
            return false;
        }
    }
    catch (error) {
        console.error("Faield to login " + error)
    }
} 

async function getUserData(access_token) {
    let json_resp = null;
    try {
        const response = await fetch(`${SERVER_URL}/api/users/getUser`, {
            method: "GET",
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            }
        });
    
        json_resp = await response.json();
    }
    catch (error) {
        console.error("Faield to login " + error)
    }

    console.log(json_resp);
    if (json_resp !== null) {
        localStorage.setItem('user_details', JSON.stringify(json_resp));
    }

    else {
        document.getElementById("informField").innerHTML = `<span class="text-danger">Login error. Try again.</span>`
    }    
}