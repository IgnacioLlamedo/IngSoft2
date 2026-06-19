const tablaModal = document.getElementById("tablaModal");
const closeModal = document.getElementById("closeModal");

// engancha todos los links con clase .classesLink
document.querySelectorAll(".classesLink").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault(); 
    tablaModal.style.display = "flex";
  });
});

if (closeModal) {
  closeModal.addEventListener("click", () => {
    tablaModal.style.display = "none";
  });


  window.addEventListener("click", (e) => {
    if (e.target === tablaModal) {
      tablaModal.style.display = "none";
    }
  });
}
