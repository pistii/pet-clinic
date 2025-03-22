document.getElementById("loginBtn").addEventListener("click", loginBtnPress)

        
async function loginBtnPress(event) {
    event.preventDefault();
    let form = document.getElementById("form");
    let email = form.email.value;
    let password = form.password.value;

    
    //Sends a login request to the server
    let resp = await login(email, password);
    
    if (resp === null) {
        document.getElementById("informField").innerHTML = `<span class="text-danger">Failed to login. Please try again later</span>`
        return;
    }

    //get the user details with the access token
    await getUserData(resp.access_token);
    window.location.href = '/appointments';
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
    }
    catch (error) {
        console.error("Faield to login " + error)
    }

    if (json_resp !== null) {
        localStorage.setItem("access_token", json_resp.access_token);
        localStorage.setItem("refresh_token", json_resp.refresh_token);
    }    
    return json_resp;
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