const password = document.getElementById("password");
const passwordRequirementErrorMsg = document.getElementById("passwordRequirementError");
const passwordIsEmpty = () => password.value.trim() === "";

const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordErrorMsg = document.getElementById("confirmPasswordError");
const confirmPasswordIsEmpty = () => confirmPassword.value.trim() === "";

const resetPasswordErrorMsg = document.getElementById("registerError");


function checkPasswordRequirement() {
    if(passwordIsEmpty())
        return "Error al registrarse. Se debe especificar la contraseña.";

    if(password.value.trim().length < 6)
        return "Error al registrarse. La contraseña debe tener al menos 6 caracteres.";
}

function checkConfirmPassword() {
    if(confirmPasswordIsEmpty())
        return "Error al registrarse. Se debe confirmar la contraseña en el campo dado.";

    if(password.value.trim() !== confirmPassword.value.trim())
        return "Error al registrarse. La contraseña especificada y su confirmación deben coincidir.";
}

function checkErrors() {
    const passwordError = checkPasswordRequirement();
    if(passwordError) {
        return passwordError;
    }

    const confirmPasswordError = checkConfirmPassword();
    if(confirmPasswordError) {
        return confirmPasswordError;
    }
}





// Password handler
const passwordVisibilityButton = document.getElementById("password-visibility-button");
const passwordVisibilityIcon = document.getElementById("password-visibility-icon");
let passwordIsVisible = false;

passwordVisibilityButton.addEventListener("click" ,async () => {
    passwordIsVisible = !passwordIsVisible;

    if(passwordIsVisible) 
        showPassword(password, passwordVisibilityButton, passwordVisibilityIcon);
    else
        hidePassword(password, passwordVisibilityButton, passwordVisibilityIcon);
});


const confirmPasswordVisibilityButton = document.getElementById("confirm-password-visibility-button");
const confirmPasswordVisibilityIcon = document.getElementById("confirm-password-visibility-icon");
let confirmPasswordIsVisible = false;

confirmPasswordVisibilityButton.addEventListener("click" ,async () => {
    confirmPasswordIsVisible = !confirmPasswordIsVisible;

    if(confirmPasswordIsVisible) 
        showPassword(confirmPassword, confirmPasswordVisibilityButton, confirmPasswordVisibilityIcon);
    else
        hidePassword(confirmPassword, confirmPasswordVisibilityButton, confirmPasswordVisibilityIcon);
});


function showPassword(button, visibilityButton, visibilityIcon) {
    button.type = "text";
    visibilityIcon.src = "/Images/Inputs/eye-icon-visible-white.png";
    visibilityButton.ariaLabel = "Ocultar contraseña";
}

function hidePassword(button, visibilityButton, visibilityIcon) {
    button.type = "password";
    visibilityIcon.src = "/Images/Inputs/eye-icon-hidden-white.png";
    visibilityButton.ariaLabel = "Mostrar contraseña";
}









const parametrosURL = new URLSearchParams(window.location.search);
const email = parametrosURL.get('email');

document.getElementById("reset-password-form").addEventListener("submit", async (event) => {

    event.preventDefault();

    const error = checkErrors();
    if(error) {
        resetPasswordErrorMsg.textContent = error;
        resetPasswordErrorMsg.hidden = false;
        return;
    }
    resetPasswordErrorMsg.hidden = true;

    const data = {
        mail: email,
        contraseña: password.value,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/resetpass", {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: dataString
    });

    const resData = await res.json();
    
    if(resData.success)
        window.location.href = resData.redirect;
    else 
    {
        resetPasswordErrorMsg.textContent = resData.message;
        resetPasswordErrorMsg.hidden = false;
    }
});
