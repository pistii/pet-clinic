const user_role = localStorage.getItem("role");
const user_name = localStorage.getItem("name");
const route = window.location.pathname;

console.log(route)

const selectNavbar = () => {

  if (user_role === "admin") adminNav();
  if (user_role === "user") userNav();
  if (user_role === "assistant") assistant();
  else visitorNav();
}

const adminNav = () => {
  document.getElementById("navbar").innerHTML = `
    <ul class="navbar-nav">
      <li class="nav-item">
        <span class="nav-link text-light">Welcome, ${user_name}</span>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/appointments" ? 'active' : ""}" href="/appointments">Appointments</a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/users" ? 'active' : ""}" href="/users">Users</a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/details" ? 'active' : ""}" href="/details">Details</a>
      </li>
      <li class="nav-item justify-content-end">
        <a class="nav-link" onclick="logout()" href="#">Exit</a>
      </li>
    </ul>
  `;
}

const assistant = () => {
  document.getElementById("navbar").innerHTML = `
    <ul class="navbar-nav">
      <li class="nav-item">
        <span class="nav-link text-light">Welcome, ${user_name}</span>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/" ? 'active' : ""}" href="/appointments">Today</a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/appointments" ? 'active' : ""}" href="/appointments">Appointments</a>
      </li>
      <li class="nav-item">
        <a class="nav-link ${route == "/details" ? 'active' : ""}" href="/details">Details</a>
      </li>
      <li class="nav-item justify-content-end">
        <a class="nav-link" onclick="logout()" href="#">Exit</a>
      </li>
    </ul>
  `;
}

const userNav = () => {
  document.getElementById("navbar").innerHTML = `
  <ul class="navbar-nav">
      <li class="nav-item">
      <span class="nav-link text-light">Welcome, ${user_name}</span>
      </li>
      <li class="nav-item">
      <a class="nav-link ${route == "/appointments" || route == "/" ? 'active' : ""}" href="/appointments">Appointments</a>
      </li>
      <li class="nav-item">
      <a class="nav-link ${route == "/create_appointment" ? 'active' : ""}" href="/create_appointment">Request appointment</a>
      </li>
      <li class="nav-item">
      <a class="nav-link ${route == "/details" ? 'active' : ""}" href="/details">Details</a>
      </li>
      <li class="nav-item justify-content-end">
        <a class="nav-link" onclick="logout()" href="#">Exit</a>
      </li>
  </ul>
  `
}

const visitorNav = () => {
  document.getElementById("navbar").innerHTML =  `
  <ul class="navbar-nav">
      <li class="nav-item">
      <a class="nav-link ${route == "/welcome" ? 'active' : ""}" href="/welcome">Home</a>
      </li>
      <li class="nav-item ${route == "/login" ? 'active' : ""}">
      <a class="nav-link" href="/login">Login</a>
      </li>
      <li class="nav-item ${route == "/appointment_request" ? 'active' : ""}">
      <a class="nav-link" href="/appointment_request">Appointment requzest</a>
      </li>
  </ul>
  `
}

function logout() {
  localStorage.clear();
  window.location.replace("/");
}

class Header extends HTMLElement {
    //SRC: https://www.freecodecamp.org/news/reusable-html-components-how-to-reuse-a-header-and-footer-on-a-website/
    constructor() {
        super();
    }
    
    connectedCallback() {
        this.innerHTML = `
      <style>
        nav {
          display: flex;
          align-items: center;
          justify-content: center;
          background-color:  #0a0a23;
        }

        ul {
          padding: 0;
        }

        a {
          font-weight: 700;
          margin: 0 25px;
          color: #fff;
          text-decoration: none;
        }

        a:hover {
          padding-bottom: 5px;
          box-shadow: inset 0 -2px 0 0 #fff;
        }
      </style>
      <header>
         <nav class="navbar navbar-expand-lg navbar-dark bg-dark rounded">
            <div class="container-fluid">
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbar"
                aria-controls="navbar" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse justify-content-md-center" id="navbar">
                </div>
            </div>
        </nav>
      </header>
    `;

    selectNavbar();    
    }
}

customElements.define('header-component', Header);