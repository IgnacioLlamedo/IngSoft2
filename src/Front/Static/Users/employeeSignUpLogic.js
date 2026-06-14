const signUpEmployeeBtn = document.getElementById('signUpEmployeeBtn');
const dni = document.getElementById("dni");
const birthDateInput = document.getElementById("birthDate");
const registerErrorMsg = document.getElementById("registerError");


window.addEventListener('DOMContentLoaded', () => {
    // signUpEmployeeBtn.style.backgroundColor = '#006fd6';
    signUpEmployeeBtn.style.backgroundColor = 'white';
    signUpEmployeeBtn.style.color = '#D01F25';
    signUpEmployeeBtn.style.fontWeight = '600';
});

function checkDniRequirement() {
    if(dni.value.length !== 8)
        return "Error al registrarse. El DNI debe tener 8 dígitos."

    //if(dni < X000000) // No sé qué límites poner, aparte de que deberían ser dinámicos como hice con la edad.
        //return "Error al registrarse. El DNI es inválido."
}


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

function checkBirthDate() {
    const age = calculateAge();
    
    if((age <= 0) || (age >= 90))
        return "Error al registrarse. Ingrese una fecha de nacimiento válida.";

    if(age < 14)
        return "Error al registrarse. La edad mínima para registrarse son 14 años.";
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


hasOtherHistory.addEventListener("click", () => toggleFields(otherHistoryFields)); 

hasSurgeries.addEventListener("click", () => toggleFields(surgeriesFields)); 

hasAllergies.addEventListener("click", () => toggleFields(allergiesFields)); 

activityCheckbox.addEventListener("click", () => toggleFields(activityFields)); 

function toggleFields(fields) {
    for(const field of fields) {
        const isHidden = field.hasAttribute("hidden");

        field.hidden = !isHidden;
        field.toggleAttribute("required");

        
        if(!isHidden)
            field.value = "";
    }
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

    const birthDateError = checkBirthDate();
    if(birthDateError) {
        return birthDateError;
    }

    const dniError = checkDniRequirement();
    if(dniError) {
        return dniError;
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





document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    
    registerErrorMsg.hidden = true;

    const error = checkErrors();
    if(error) {
        registerErrorMsg.textContent = error;
        registerErrorMsg.hidden = false;
        return;
    }

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
        registerErrorMsg.hidden = false;
    }
})