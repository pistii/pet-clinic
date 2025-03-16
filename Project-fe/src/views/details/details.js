const user_details = JSON.parse(localStorage.getItem("user_details"));
const username = user_details.username;
const email = user_details.email;

let form = document.getElementById("detailsForm");
    form.username.value = username;
    form.email.value = email;
    


async function saveDetails() {
    console.log("save")
}