console.log(user_role)

const routes = {
    "/": "src/views/welcome.html",
    "/password-reset": "/src/views/password_reset/password_reset.html",
    "/forgot-password": "src/views/forgot_password/forgot_password.html",

    "/login": "src/views/login.html",
    "/register": "src/views/register.html",
    "/create_appointment": "src/views/user/create_appointment/create_appointment.html",
    "/welcome": "src/views/welcome.html",
    "/appointments": user_role == "user" 
    ? "src/views/user/appointments/appointments.html" 
    : "src/views/assistant/calendar/assign.html",
    
    "/details": "/src/views/details/details.html",
    "/users": "/src/views/admin/users.html"
};

// Tartalom betöltése
const loadContent = async (path) => {
    const contentDiv = document.getElementById("app");
    
    const user_data = JSON.parse(localStorage.getItem('user_details'));

    const user_routes = ["/", "/create_appointment", "/appointments", "/details"]
    const assistant_routes = ["/", "/appointments", "/details", "/appointments"]
    const admin_routes = ["/", "/appointments", "/users", "/details"]
    const visitor_routes = ["/", "/login", "/register", "/welcome", "/create_appointment", 
        "/forgot-password", "/password-reset"]


    if (routes[path]) {
        try {
            if (user_data) { //Registered users, admins, assistants
                const current_role = user_data.role;
                //console.log(current_role)
                if (current_role) {
                    switch (current_role) {
                        case "user":
                            if (!user_routes.includes(path)) {
                                window.location.replace("/");
                                break;
                            }
                            loadPage(routes[path]);
                            break;
                        case "assistant":
                            if (!assistant_routes.includes(path)) {
                                window.location.replace("/");
                                break;
                            }
                            loadPage(routes[path]);
                            break;
                        case "admin":
                            if (!admin_routes.includes(path)) {
                                window.location.replace("/");
                            }
                            loadPage(routes[path]);
                            break;
                        default:                            
                            break;
                    }
                }
                else { //probably modified the role manually, or cannot unable to load the user details
                    window.location.replace("/");
                }
            }
            
            else { //Visitors
                if (!visitor_routes.includes(path)) {
                    window.location.replace("/");
                }
                loadPage(routes[path])
            }
        } catch (error) {
            console.error(error)
            contentDiv.innerHTML = "<p>404 Hiba történt a tartalom betöltésekor.</p>";
        }
    }
    else if (path.startsWith("/password-reset") && !user_data) {
        // Do nothing just catch these paths
        loadPage(routes["/password-reset"])
    }
    else {
        contentDiv.innerHTML = "<p>404 Page not found.</p>";
        setTimeout(() => {
            window.location.replace("/");
        }, 3000);
    }
};


function loadPage(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            document.getElementById('app').innerHTML = html;
            executeScripts(); //Reload scripts
        })
        .catch(error => console.error('Error loading page:', error));
}

function executeScripts() {
    document.querySelectorAll("#app script").forEach(oldScript => {
        //Exclude files
        if (oldScript.src && oldScript.src.includes('vite')) {
            return;
        }

        const newScript = document.createElement("script");
        newScript.textContent = oldScript.textContent;  // If inline script
        if (oldScript.src) {
            newScript.src = oldScript.src;  // External script
            newScript.async = true;
            newScript.type = "module"
        }

        document.head.appendChild(newScript);
        oldScript.remove();
    });
}


// URL változás kezelése
const navigateTo = (path) => {
    window.history.pushState({}, path, window.location.origin + path);
    loadContent(path);
};

// Eseménykezelő a linkekre
document.addEventListener("click", (e) => {
    if (e.target.matches("[data-link]")) {
        e.preventDefault();
        navigateTo(e.target.getAttribute("href"));
    }
});

// Böngésző vissza / előre gomb figyelése
window.addEventListener("popstate", () => {
    loadContent(window.location.pathname);
});

// Alapértelmezett tartalom betöltése
document.addEventListener("DOMContentLoaded", () => {
    loadContent(window.location.pathname);
});
