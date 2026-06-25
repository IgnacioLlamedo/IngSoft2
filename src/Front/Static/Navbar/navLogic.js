const userIcon = document.getElementById("userIcon");
const userOptions = document.getElementById("userOptions");

const toggleIcon = document.getElementById("toggleIcon");
const menuToggel = document.querySelector(".menu-toggel");

const parametersURL = new URLSearchParams(window.location.search);
const statusPago = parametersURL.get('status');


userIcon.addEventListener("click", () => {
    userOptions.classList.toggle("user-options-open")
})

document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userOptions.contains(e.target))
        userOptions.classList.remove("user-options-open");
});


document.querySelectorAll(".logout").forEach(el => {
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  });
});



toggleIcon.addEventListener("click", () => {
  menuToggel.classList.toggle("open");
});