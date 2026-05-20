const password = document.getElementById("password");
const passwordRequirementErrorMsg = document.getElementById("passwordRequirementError");
const passwordIsEmpty = () => password.value.trim() === "";
let passwordRequirementError = false;

const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordErrorMsg = document.getElementById("confirmPasswordError");
const confirmPasswordIsEmpty = () => confirmPassword.value.trim() === "";
let confirmPasswordError = false;

const errorInForm = () => passwordRequirementError || confirmPasswordError;


password.onchange = function() {
    checkPasswordRequirement();
    checkConfirmPassword();
}

confirmPassword.onchange = function() {
    checkConfirmPassword();
}

function checkPasswordRequirement() {
    if(!passwordIsEmpty() && password.value.trim().length < 6)
        enablePasswordRequirementError();
    else
        disablePasswordRequirementError();
}

function enablePasswordRequirementError() {
    if(passwordRequirementError)
        return;

    password.classList.add("passwordRequirementError");

    passwordRequirementErrorMsg.textContent = "Las contraseña debe tener al menos 6 caracteres."
    passwordRequirementErrorMsg.classList.remove("hidden");

    passwordRequirementError = true;
}

function disablePasswordRequirementError() {
    if(!passwordRequirementError)
        return;

    password.classList.remove("passwordRequirementError");

    passwordRequirementErrorMsg.textContent = ""
    passwordRequirementErrorMsg.classList.add("hidden");

    passwordRequirementError = false;
}



function checkConfirmPassword() {
    if(confirmPasswordIsEmpty()) {
        if(confirmPasswordError)
            disableConfirmPasswordError();
        return;
    }

    if(confirmPassword.value !== password.value)
        enableConfirmPasswordError();
    else
        disableConfirmPasswordError();
}

function enableConfirmPasswordError() {
    if(confirmPasswordError)
        return;

    password.classList.add("confirmPasswordError");
    confirmPassword.classList.add("inputError");

    confirmPasswordErrorMsg.textContent = "Las contraseñas no coinciden."
    confirmPasswordErrorMsg.classList.remove("hidden");

    confirmPasswordError = true;
}

function disableConfirmPasswordError() {
    if(!confirmPasswordError)
        return;

    password.classList.remove("confirmPasswordError");
    confirmPassword.classList.remove("inputError");

    confirmPasswordErrorMsg.classList.add("hidden");
    confirmPasswordErrorMsg.textContent = "";

    confirmPasswordError = false;
}



const parametrosURL = new URLSearchParams(window.location.search);

const email = parametrosURL.get('email');

document.getElementById("reset-password-form").addEventListener("submit", async (event) => {

    event.preventDefault();

    if(errorInForm())
        return;

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
    console.log(resData);
    window.location.href = resData.redirect;
});
