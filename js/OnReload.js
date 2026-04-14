window.addEventListener("DOMContentLoaded", () => {
    const page = GetPageFromURL() || "Home";
    LoadPage(page);
});