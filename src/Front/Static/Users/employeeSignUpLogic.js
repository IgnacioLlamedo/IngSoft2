const signUpEmployeeBtn = document.getElementById('signUpEmployeeBtn');
const fechaInput = document.getElementById("fechaInput");
const registerErrorMsg = document.getElementById("registerError");
const registerForm = document.getElementById("registerForm");

const edadMax = 90;
const fechaMin = new Date();
fechaMin.setFullYear(fechaMin.getFullYear() - edadMax);
fechaInput.min = fechaMin.toISOString().split('T')[0];

const edadMin = 14;
const fechaMax = new Date();
fechaMax.setFullYear(fechaMax.getFullYear() - edadMin);
fechaInput.max = fechaMax.toISOString().split('T')[0];


window.addEventListener('DOMContentLoaded', () => {
    // signUpEmployeeBtn.style.backgroundColor = '#006fd6';
    signUpEmployeeBtn.style.backgroundColor = 'white';
    signUpEmployeeBtn.style.color = '#D01F25';
    signUpEmployeeBtn.style.fontWeight = '600';
});

function validateSignUpForm() {
    let errorMsg = '';
    const nombre = document.getElementById('nombre').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const email = document.getElementById('email').value.trim();
    const fecha = document.getElementById('fechaInput').value;

    if (!nombre || !dni || !email || !fecha)
        return 'Por favor completa todos los campos.';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email))
        return 'Por favor ingresa un email válido.';

    if (dni.length !== 8)
        return 'El DNI debe tener 8 dígitos.';

    if (!fecha || new Date(fecha) < fechaMin || new Date(fecha) > new Date())
        return 'Error al registrar. La fecha de nacimiento no es válida.';

    if (new Date(fecha) > fechaMax)
        return 'Error al registrar. La edad mínima es de 14 años.';

    return errorMsg;
}


registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {

    registerErrorMsg.hidden = true;
    
    const errorMsg = validateSignUpForm();
    if (errorMsg !== '') {
        throw new Error(errorMsg);
    }

    const form = event.target;
    const Role = JSON.parse(form.dataset.roleEnum);

    const userData = {
        nombre: form.nombre.value,
        dni: form.dni.value,
        mail: form.email.value,
        nacimiento: form.fechaInput.value,
        rol: Role.EMPLOYEE,
    }

    const response = await fetch("/api/employee-signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        credentials: 'include',
        body: JSON.stringify({ userData: userData })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al guardar el perfil');
    }
    console.log(response);

    registerErrorMsg.style.textAlign = 'center';
    registerErrorMsg.style.color = 'green';
    registerErrorMsg.innerHTML = `
        <b>Empleado registrado exitosamente.</b><br>
        Ha sido enviado un correo a
        <a href="mailto:${userData.mail}" style="font-weight: 600; color: #cecece">${userData.mail}</a>
        con instrucciones para realizar la verificación.`;
    registerErrorMsg.hidden = false;

    } catch (error) {
        console.error('Error:', error);
        registerErrorMsg.style.color = '#ff1e1e';
        registerErrorMsg.textContent = error.message;
        registerErrorMsg.hidden = false;
    }
});