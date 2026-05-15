
const password = document.getElementById("password");
const passwordRequirementErrorMsg = document.getElementById("passwordRequirementError");
const passwordIsEmpty = () => password.value.trim() === "";
let passwordRequirementError = false;

const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordErrorMsg = document.getElementById("confirmPasswordError");
const confirmPasswordIsEmpty = () => confirmPassword.value.trim() === "";
let confirmPasswordError = false;

const birthDateInput = document.getElementById("birthDate");
const birthDateErrorMsg = document.getElementById("birthDateError");
let birthDateError = false;

const errorInForm = () => passwordRequirementError || confirmPasswordError || birthDateError;

const hasSurgeries = document.getElementById("hasSurgeries");
const surgeriesFields = document.getElementsByClassName("surgeriesFields");

const hasAllergies = document.getElementById("hasAllergies");
const allergiesFields = document.getElementsByClassName("allergiesFields");

const activityCheckbox = document.getElementById("physicallyActive");
const activityFields = document.getElementsByClassName("physicallyActiveFields");

const registerErrorMsg = document.getElementById("registerError");


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



birthDateInput.oninput = function() {
    const age = calculateAge();
    if((age < 14) || (age > 100))
        enableBirthDateError();
    else
        disableBirthError();
}

function calculateAge() {
    const birthDate = new Date(birthDateInput.value);
    const dateNow = new Date(Date.now());

    let age = dateNow.getFullYear() - birthDate.getFullYear();
    const monthDifference = dateNow.getMonth() - birthDate.getMonth();

    if(monthDifference < 0 || ( (monthDifference === 0) && (dateNow.getDate() < birthDate.getDate()) ))
        age--;

    return age;
}

function enableBirthDateError() {
    if(birthDateError)
        return;

    birthDateInput.classList.add("inputError")

    birthDateErrorMsg.innerHTML =
    `<h3>Para crear una cuenta se necesita: </h3> <br>
    - Tener edad mínima de 14 años.<br> <br>
    - Ingresar una fecha de nacimiento con menos de 100 años.`;
    
    birthDateErrorMsg.classList.remove("hidden");

    birthDateError = true;
}

function disableBirthError() {
    if(!birthDateError)
        return;

    birthDateInput.classList.remove("inputError")

    birthDateErrorMsg.textContent = "";
    birthDateErrorMsg.classList.add("hidden");

    birthDateError = false;
}



hasSurgeries.onclick = function() {
    for(const field of surgeriesFields) {
        if(!field.classList.contains("hidden"))
            field.value = "";
        field.classList.toggle("hidden");
        field.toggleAttribute("required");
    }
}

hasAllergies.onclick = function() {
    for(const field of allergiesFields) {
        if(!field.classList.contains("hidden"))
            field.value = "";
        field.classList.toggle("hidden");
        field.toggleAttribute("required");
    }
}

activityCheckbox.onclick = function() {
    for(const field of activityFields) {
        if(!field.classList.contains("hidden"))
            field.value = "";
        field.classList.toggle("hidden");
        field.toggleAttribute("required");
    }
}









document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    if(errorInForm()) {
        registerErrorMsg.classList.remove("hidden");
        return;
    }

    registerErrorMsg.classList.add("hidden");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    data.hipertension = !(data.hipertension === undefined)
    data.diabetes = !(data.diabetes === undefined)
    data.asma = !(data.asma === undefined)
    data.cardiacos = !(data.cardiacos === undefined)
    data.artitris = !(data.artitris === undefined)
    data.epilepsia = !(data.epilepsia === undefined)
    data.lesiones = !(data.lesiones === undefined);
    data.fuma = !(data.fuma === undefined)
    data.alcohol = !(data.alcohol === undefined)
    data.sintomasRecientes = !(data.sintomasRecientes === undefined)
    data.dificultadDormir = !(data.dificultadDormir === undefined)
    data.actividadFisica = !(data.actividadFisica === undefined)


    console.log(data);
    // autenticar?
    /* const res = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(data)
    }) */
})