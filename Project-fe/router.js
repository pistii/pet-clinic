
const routes = {
    "/": "src/views/welcome.html",
    "/login": "src/views/login.html",
    "/register": "src/views/register.html",
    "/appointment_request": "src/views/user/create_appointment/create_appointment.html",
    "/welcome": "src/views/welcome.html"
};

// Tartalom betöltése
const loadContent = async (path) => {
    const contentDiv = document.getElementById("app");
    if (routes[path]) {
        try {
            loadPage(routes[path])
        } catch (error) {
            contentDiv.innerHTML = "<p>404 Hiba történt a tartalom betöltésekor.</p>";
        }
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
        }
        console.log(newScript)
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
