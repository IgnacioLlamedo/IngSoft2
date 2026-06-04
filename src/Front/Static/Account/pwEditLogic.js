const pwForm = document.getElementById('passwordForm');
const pwEditBtn = document.getElementById('pwEditBtn');
const pwSaveBtn = document.getElementById('pwSaveBtn');
const pwCancelBtn = document.getElementById('pwCancelBtn');
const pwMessageDiv = document.getElementById('passwordMessage');

let isEditPasswordMode = false;

document.addEventListener('DOMContentLoaded', () => {
    setupPwEventListeners();
});

function resetPasswordForm() {
    document.getElementById('contraseña-actual').value = '';
    document.getElementById('contraseña-nueva').value = '';
    document.getElementById('contraseña-confirmar').value = '';
}

function setupPwEventListeners() {    
    pwEditBtn.addEventListener('click', toggleEditPasswordMode);
    pwSaveBtn.addEventListener('click', changePassword);
    pwCancelBtn.addEventListener('click', cancelPasswordEdit);
    setupPasswordVisibilityToggle();
}

function toggleEditPasswordMode() {
    isEditPasswordMode = !isEditPasswordMode;

    const formInputs = passwordForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = !isEditPasswordMode;
    });

    if (isEditPasswordMode) {
        pwEditBtn.style.display = 'none';
        pwSaveBtn.style.display = 'block';
        pwCancelBtn.style.display = 'block';
        pwMessageDiv.textContent = '';
        pwMessageDiv.className = 'message';
    } else {
        pwEditBtn.style.display = 'block';
        pwSaveBtn.style.display = 'none';
        pwCancelBtn.style.display = 'none';
        setPasswordInputsType('password');
    }
}

function setPasswordInputsType(type) {
    const passwordInputs = passwordForm.querySelectorAll('input[id^="contraseña-"]');
    passwordInputs.forEach(input => {
        input.type = type;
    });

    const iconSrc = type === 'password'
        ? '/Images/Inputs/eye-icon-hidden-white.png'
        : '/Images/Inputs/eye-icon-visible-white.png';
    const ariaLabel = type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña';

    const iconImages = document.querySelectorAll('.password-toggle-icon');
    iconImages.forEach(icon => {
        icon.src = iconSrc;
        icon.alt = ariaLabel;
    });

    const toggles = document.querySelectorAll('.password-toggle-button');
    toggles.forEach(toggle => {
        toggle.setAttribute('aria-label', ariaLabel);
    });
}

function setupPasswordVisibilityToggle() {
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
            toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    });
}


async function changePassword() {
	if (!validatePasswordLocal()) {
		return;
	}

	console.log("Validación local de pw exitosa, comparando con backend...");

	try {
        // Checking current password before setting new one
		const res1 = await fetch("/api/check-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                contraseña: document.getElementById("contraseña-actual").value,
            }),
        });

        if (!res1.ok) {
            const errorData = await res1.json();
            throw new Error(
                errorData.message || "Error al verificar la contraseña actual",
            );
        }

        const responseData = await res1.json();
        const isPasswordCorrect = responseData.success;

        if (!isPasswordCorrect) {
            showPwMessage("La contraseña actual es incorrecta", "error", "passwordMessage");
            return;
        }
        
        // If current password is correct, proceed to set the new password
        const res2 = await fetch("/api/set-password", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({
				contraseña: document.getElementById("contraseña-nueva").value,
			}),
		});

		if (!res2.ok) {
			const errorData = await res2.json();
			throw new Error(
				errorData.message || "Error al cambiar la contraseña",
			);
		}

		const updatedUser = await res2.json();
		console.log("Contraseña actualizada:", updatedUser);

		// Exit edit password mode
		resetPasswordForm();
		isEditPasswordMode = true;
		toggleEditPasswordMode();

		showPwMessage("Contraseña actualizada exitosamente", "success", "passwordMessage");

		// Clear message after 3 seconds
		setTimeout(() => {
			pwMessageDiv.textContent = "";
			pwMessageDiv.className = "message";
		}, 3000);
	} catch (error) {
		showPwMessage("Error: " + error.message, "error", "passwordMessage");
		console.error("Error:", error);
	}
}


// Cancel password edit
function cancelPasswordEdit() {
    // Restore original values
    resetPasswordForm();

    // Exit edit mode
    isEditPasswordMode = true;
    toggleEditPasswordMode();

    showPwMessage('Cambios cancelados', 'info', 'passwordMessage');

    setTimeout(() => {
        pwMessageDiv.textContent = '';
        pwMessageDiv.className = 'message';
    }, 2000);
}


// Local validations
function validatePasswordLocal() {
    const contraseñaActual = document.getElementById('contraseña-actual').value;
    const contraseñaNueva = document.getElementById('contraseña-nueva').value;
    const contraseñaConfirmar = document.getElementById('contraseña-confirmar').value;
    console.log("Validando localmente:", { contraseñaActual, contraseñaNueva, contraseñaConfirmar });

    if (!contraseñaActual || !contraseñaNueva || !contraseñaConfirmar) {
        showPwMessage('Por favor completa todos los campos', 'error', 'passwordMessage');
        return false;
    }
    
    if (contraseñaNueva !== contraseñaConfirmar) {
        showPwMessage('Las contraseñas no coinciden', 'error', 'passwordMessage');
        return false;
    }
    
    if (contraseñaNueva.length < 6) {
        showPwMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error', 'passwordMessage');
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