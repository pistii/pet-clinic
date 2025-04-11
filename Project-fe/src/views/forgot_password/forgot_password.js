document.getElementById("forgotPassword").addEventListener("click", forgotPasswordClick)

async function forgotPasswordClick(event) {
    event.preventDefault();
    var forms = document.querySelectorAll('.needs-validation')
    forms.forEach(i => i.classList.add("was-validated"))
    
    let email = document.getElementById("email").value;

    await fetch(`${SERVER_URL}/api/users/forgot-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({email: email})
    }).then(async resp => resp.ok ? showSuccess() : showFailed(resp.status, await resp.json()))
}

function showSuccess() {
    document.getElementById("informField").innerHTML = 
    `<span class="text-success">Password reset request success. Check your emails</span>`
}

function showFailed(status, resp) {
    let informDiv = document.getElementById("informField");
    if (status === 400 || status === 404) {
        informDiv.innerHTML = `<span class="text-danger">${resp.detail}</span>`
        return;
    }
    informDiv.innerHTML = `<span class="text-danger">Failed email request.</span>`
}