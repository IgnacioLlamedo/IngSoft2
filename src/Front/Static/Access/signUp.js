
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

const hasOtherHistory = document.getElementById("hasOtherHistory");
const otherHistoryFields = document.getElementsByClassName("otherHistoryFields");

const hasSurgeries = document.getElementById("hasSurgeries");
const surgeriesFields = document.getElementsByClassName("surgeriesFields");

const hasAllergies = document.getElementById("hasAllergies");
const allergiesFields = document.getElementsByClassName("allergiesFields");

const activityCheckbox = document.getElementById("isPhysicallyActive");
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


hasOtherHistory.onclick = function() {
    for(const field of otherHistoryFields) {
        if(!field.classList.contains("hidden"))
            field.value = "";
        field.classList.toggle("hidden");
        field.toggleAttribute("required");
    }
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
        registerErrorMsg.textContent = "Corregí todos los errores antes de registrarte";
        registerErrorMsg.classList.remove("hidden");
        return;
    }
    registerErrorMsg.classList.add("hidden");

    const form = event.target;

    const planillaData = {
        nombreEmergencia: form.nombreCompletoContactoEmergencia.value,
        relacionEmergencia: form.relacionContactoEmergencia.value,
        telefonoEmergencia: form.telefonoContactoEmergencia.value,
        hipertension: form.tieneHipertension.checked,
        diabetes: form.tieneDiabetes.checked,
        asma: form.tieneAsma.checked,
        cardiacos: form.tieneCardiacos.checked,
        artritis: form.tieneArtritis.checked,
        epilepsia: form.tieneEpilepsia.checked,
        lesiones: form.tieneLesiones.checked,
        otrosAntecedentes: form.otrosAntecedentes.value,
        fuma: form.fuma.checked,
        alcohol: form.tomaAlcohol.checked,
        sintomasRecientes: form.sintomasRecientes.checked,
        sueño: form.horasSueño.value,
        dificultadDormir: form.tieneDificultadDormir.checked,
        nutricion: form.nutricion.value,
        cirugia: form.descripcionCirugia.value,
        fechaCirugia: form.fechaCirugia.value,
        secuelasCirugia: form.secuelasCirugia.value,
        alergias: form.alergias.value,
        medicacionAlergia: form.medicacionAlergias.value,
        actividadFisica: form.isPhysicallyActive.checked,
        frecuenciaActividad: form.frecuenciaActividadFisica.value,
        objetivo: form.objetivo.value
    }

    const planillaDataString = JSON.stringify(planillaData);

    const userData = {
        mail: form.email.value,
        dni: form.dni.value,
        contraseña: form.contraseña.value,
        nombre: form.nombreCompleto.value,
        nacimiento: form.fechaNacimiento.value,
        telefono: form.numeroTelefono.value,
        genero: form.genero.value,
        planilla: 0,
        rol: "cliente"
    }

    const userDataString = JSON.stringify(userData);

    const data = {
        userData: userData,
        planillaData: planillaData,
    }

    const dataString = JSON.stringify(data);
    console.log("Front:" + JSON.stringify(planillaData));

    // autenticar req?
    const res = await fetch("/api/register", {
        method: "POST",
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
        registerErrorMsg.textContent = resData.message;
        registerErrorMsg.classList.remove("hidden");
    }
})