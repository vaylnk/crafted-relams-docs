function IsDev() {
    const host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
}

function CheckDevAccess() {
    document.querySelectorAll(".dev").forEach(el => {
        el.style.display = IsDev() ? "block" : "none";
    });
}

document.addEventListener("DOMContentLoaded", CheckDevAccess);
