
const loginErrorMsg = document.getElementById("loginError");

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;

    const userData = {
        mail: form.email.value,
        contraseña: form.contraseña.value,
    }

    
    const userDataString = JSON.stringify(userData);

    // autenticar req?
    const res = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: userDataString
    });

    const resData = await res.json();

    console.log("Los datos recibidos en login.js al volver de loginController: ");
    console.log(resData.success);
    console.log(resData.redirect);

    if(resData.success)
        window.location.href = resData.redirect;
    else 
    {
        loginErrorMsg.textContent = resData.message;
        loginErrorMsg.removeAttribute("hidden");
    } 
})




// Password handler

const password = document.getElementById("password");
const visibilityButton = document.getElementById("visibility-button");
const visibilityIcon = document.getElementById("visibility-icon");
let isVisible = false;

visibilityButton.addEventListener("click" ,async () => {
    isVisible = !isVisible;

    if(isVisible) 
        showPassword()
    else
        hidePassword();
});


function showPassword() {
    password.type = "text";
    visibilityIcon.src = "/Images/Inputs/eye-icon-visible-white.png";
    visibilityButton.ariaLabel = "Ocultar contraseña";
}

function hidePassword() {
    password.type = "password";
    visibilityIcon.src = "/Images/Inputs/eye-icon-hidden-white.png";
    visibilityButton.ariaLabel = "Mostrar contraseña";
}