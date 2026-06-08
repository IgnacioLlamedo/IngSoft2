const asistenciaBtn = document.querySelector(".user-options-list a:nth-child(2)");
const assistanceModal = document.getElementById("assistanceModal");
const closeAssistance = document.getElementById("closeAssistance");

if (asistenciaBtn) {
  asistenciaBtn.addEventListener("click", (e) => {
    e.preventDefault();
    assistanceModal.style.display = "flex"; // abrir modal
  });
}

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

