const routes = {
    "/": "src/views/welcome.html",
    "/login": "src/views/login.html",
    "/appointment_request": "src/views/user/create_appointment/create_appointment.html"
};

// Tartalom betöltése
const loadContent = async (path) => {
    const contentDiv = document.getElementById("app");
    if (routes[path]) {
        try {
            const response = await fetch(routes[path]);
            const content = await response.text();
            contentDiv.innerHTML = content;
        } catch (error) {
            contentDiv.innerHTML = "<p>404 Hiba történt a tartalom betöltésekor.</p>";
        }
    }
};

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
