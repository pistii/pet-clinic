document.getElementById("register").addEventListener("click", register)

async function register(event) {
    event.preventDefault();
    var forms = document.querySelectorAll('.needs-validation')
    forms.forEach(i => i.classList.add("was-validated"))

    const regForm = document.getElementById('registerForm');
    const name = regForm.name.value;
    const email = regForm.email.value;
    const password = regForm.password.value;

    let px = 0;

    if (!name || !email || !password) {
        document.getElementById("informField").innerHTML = `<span class="text-danger">Name, email and password fields cannot be empty</span>`;
        var forms = document.querySelectorAll('.needs-validation')
        return;
    }
    const response = await fetch(`${SERVER_URL}/api/users/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            'name': name,
            'email': email,
            'password': password
        })
    });

    let json_resp = await response.json();
    console.log(json_resp)
    if (response.ok) 
        {
            document.getElementById("informField").innerHTML = `<span class="text-success">Register completed. You will be redirected to the login page</span>`
            
            setInterval(() => {
                document.getElementById("progressbar").style.width = px+'px'
                px+=7;

                setTimeout(() => {
                    window.location.replace('/login');
                }, 3000);
            }, 50);
        }
    else if (response.status == 400 && json_resp.detail == "Email already registered") {
        document.getElementById("informField").innerHTML = `<span class="text-danger">This email is used. Register failed</span>`
    }
    else document.getElementById("informField").innerHTML = `<span class="text-danger">Something went wrong.</span>`
}
