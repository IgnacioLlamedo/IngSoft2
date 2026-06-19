const assistanceModal = document.getElementById("assistanceModal");
const closeAssistance = document.getElementById("closeAssistance");

// engancha todos los botones con clase .asistenciaBtn
document.querySelectorAll(".asistenciaBtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    assistanceModal.style.display = "flex"; // abrir modal
  });
});

if (closeAssistance) {
  closeAssistance.addEventListener("click", () => {
    assistanceModal.style.display = "none"; // cerrar modal
  });
}

window.addEventListener("click", (e) => {
  if (e.target === assistanceModal) {
    assistanceModal.style.display = "none";
  }
});
