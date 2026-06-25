const pwForm = document.getElementById('passwordForm');
const pwSaveBtn = document.getElementById('pwSaveBtn');
const pwMessageDiv = document.getElementById('passwordMessage');


document.addEventListener('DOMContentLoaded', () => {
    setupPwEventListeners();
    setEditPasswordMode();
});

function setupPwEventListeners() {    
    pwSaveBtn.addEventListener('click', savePassword);
    setUpPasswordVisibilityToggle();
}

function setEditPasswordMode() {
    const formInputs = passwordForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = false;
    });

    pwSaveBtn.style.display = 'block';
    pwMessageDiv.textContent = '';
    pwMessageDiv.className = 'message';
}

function setUpPasswordVisibilityToggle() {
    const toggles = document.querySelectorAll('.password-toggle-button');
    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const wrapper = toggle.closest('.password-wrapper');
            if (!wrapper) return;
            const input = wrapper.querySelector('input');
            const icon = toggle.querySelector('.password-toggle-icon');
            if (!input || !icon) return;
            const show = input.type === 'password';
            input.type = show ? 'text' : 'password';
            icon.src = show
                ? '/Images/Inputs/eye-icon-visible-white.png'
                : '/Images/Inputs/eye-icon-hidden-white.png';
            icon.alt = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
        });
    });
}


async function savePassword() {
	if (!validatePasswordLocal()) return;

	console.log("Validación local exitosa, comparando con backend...");    
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code'); 
    const pw = document.getElementById("contraseña-nueva").value;

	try {
        const response = await fetch("/api/employee-auth", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
                codigo: code,
				contraseña: pw,
			}),
		});

		// if (!response.success) {
		if (!response.ok) {
			const errorData = await response.json();
			throw new Error(
				errorData.message || "Error al completar el registro. Intente más tarde",
			);
		}

        const resData = await response.json();
        
		showPwMessage("¡Registro completado! Redirigiendo al inicio...", "success", "passwordMessage");

		// Redirigir a la home tras mostrar el mensaje 3 segundos
		setTimeout(() => {
            window.location.href = resData.redirect;
			// pwMessageDiv.textContent = "";
			// pwMessageDiv.className = "message";

		}, 3000);
	} catch (error) {
		showPwMessage("Error: " + error.message, "error", "passwordMessage");
		console.error("Error:", error);
	}
}

// Local validations
function validatePasswordLocal() {
    const contraseñaNueva = document.getElementById('contraseña-nueva').value;
    const contraseñaConfirmar = document.getElementById('contraseña-confirmar').value;

    if (!contraseñaNueva || !contraseñaConfirmar) {
        showPwMessage('Por favor completa todos los campos', 'error', 'passwordMessage');
        return false;
    }
    
    if (contraseñaNueva !== contraseñaConfirmar) {
        showPwMessage('Error: Las contraseñas no coinciden', 'error', 'passwordMessage');
        return false;
    }
    
    if (contraseñaNueva.length < 6) {
        showPwMessage('Error: La contraseña debe tener al menos 6 caracteres', 'error', 'passwordMessage');
        return false;
    }

    return true;
}

// Show message
function showPwMessage(message, type, id) {
    const messageDiv = document.getElementById(id);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}