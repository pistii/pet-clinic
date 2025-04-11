document.getElementById("resetPassword").addEventListener("click", resetPassword);

async function resetPassword(event) {
    event.preventDefault();
    let pw1 = document.getElementById("password1").value
    let pw2 = document.getElementById("password2").value

    if (pw1 !== pw2) {
        document.getElementById("informField").innerHTML = `<span class="text-danger">Password doesn't match</span>`
        return;
    } else if (pw1.length < 7 && pw2.length < 7) {
        document.getElementById("informField").innerHTML = `<span class="text-danger">Minimum 8 character required.</span>`
        return;
    }

    let json_data = {
        password: pw1,
        token: location.pathname.split("/")[2]
    }

    let response = await fetch(`${SERVER_URL}/api/users/verify-token`, {
        method: "POST", 
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(json_data)
    });

    if (response.ok && response.status === 200) {
        document.getElementById("informField").innerHTML = 
            `<span class="text-success">Password changed. You will be redirected to the login page.</span>`
        setTimeout(() => {
            window.location.replace("/");
        }, 3000);
    }
    else if (response.status === 400) {
        document.getElementById("informField").innerHTML = 
            `<span class="text-danger">Token is expired. 
            <a href="/forgot-password" class="text-dark">Click here</a>
             to request new email</span>`
    }
    else {
        document.getElementById("informField").innerHTML = 
            `<span class="text-danger">Password change failed.</span>`
    }
    
    
}