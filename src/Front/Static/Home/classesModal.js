const classesLink = document.getElementById("classesLink");
const tablaModal = document.getElementById("tablaModal");
const closeModal = document.getElementById("closeModal");

classesLink.addEventListener("click", (e) => {
    e.preventDefault(); // evita que navegue
    tablaModal.style.display = "flex"; // muestra el modal
});

closeModal.addEventListener("click", () => {
    tablaModal.style.display = "none"; // cierra el modal
});

// Cerrar si se hace clic fuera del contenido
window.addEventListener("click", (e) => {
    if (e.target === tablaModal) {
    tablaModal.style.display = "none";
    }
});