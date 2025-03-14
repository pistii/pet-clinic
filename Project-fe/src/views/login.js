const form = document.getElementById("form");
        
function login(event) {
    event.preventDefault();
    c = document.getElementById("form")
    console.log(c.email.value)
    console.log(c.password.value)

    console.log("login" + SERVER_URL)
}