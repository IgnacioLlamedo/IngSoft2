// Get DOM elements
const profileForm = document.getElementById('profileForm');
const passwordForm = document.getElementById('passwordForm');
const editBtn1 = document.getElementById('editBtn1');
const saveBtn1 = document.getElementById('saveBtn1');
const cancelBtn1 = document.getElementById('cancelBtn1');
const editBtn2 = document.getElementById('editBtn2');
const saveBtn2 = document.getElementById('saveBtn2');
const cancelBtn2 = document.getElementById('cancelBtn2');
const profileMessageDiv = document.getElementById('profileMessage');
const passwordMessageDiv = document.getElementById('passwordMessage');

// Mock password
const mockPassword = '123456';

// Store original values for cancellation
let originalValues = {};
let isEditProfileMode = false;
let isEditPasswordMode = false;

// Set date input maximum to ensure user is at least 14 years old
const edadMin = 14;
const fechaMax = new Date();
fechaMax.setFullYear(fechaMax.getFullYear() - edadMin);
document.getElementById("nacimiento").max = fechaMax.toISOString().split('T')[0];

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadUserProfile();
    setupEventListeners();
});

// Load user profile data
async function loadUserProfile() {
    try {        
        // TODO: Fetch user data from the backend
        /*
        const response = await fetch('/api/usuario/profile', {
            method: 'GET',
            credentials: 'include' // Include session cookies
        });
     
        if (!response.ok) {
            throw new Error('Error al cargar el perfil');
        }
        const userData = await response.json();
        */

        // Mocked user data for testing
        const userData = {
            nombre: 'Juan Pérez',
            mail: 'juan@123.com',
            dni: '12345678',
            contraseña: '********',
            nacimiento: '1990-05-15',
            telefono: '123456789',
            genero: 'masculino'
        };
           
        populateProfileForm(userData);
        storeOriginalValues();

    } catch (error) {
        showMessage('Error al cargar el perfil: ' + error.message, 'error', 'profileMessage');
        console.error('Error:', error);
    }
}

// Populate profile form with user data
function populateProfileForm(userData) {

    document.getElementById('nombre').value = userData.nombre || '';
    document.getElementById('email').value = userData.mail || '';
    document.getElementById('dni').value = userData.dni || '';
    // Format date for date input (YYYY-MM-DD)
    if (userData.nacimiento) {
        const date = new Date(userData.nacimiento);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('nacimiento').value = formattedDate;
    }
    document.getElementById('telefono').value = userData.telefono || '';
    document.getElementById('genero').value = userData.genero || '';
}

// Reset password form
function resetPasswordForm() {
    document.getElementById('contraseña-actual').value = '';
    document.getElementById('contraseña-nueva').value = '';
    document.getElementById('contraseña-confirmar').value = '';
}

// Store original values for cancellation
function storeOriginalValues() {
    originalValues = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        dni: document.getElementById('dni').value,
        nacimiento: document.getElementById('nacimiento').value,
        telefono: document.getElementById('telefono').value,
        genero: document.getElementById('genero').value
    };
}

// Setup event listeners
function setupEventListeners() {
    editBtn1.addEventListener('click', toggleEditProfileMode);
    saveBtn1.addEventListener('click', saveProfile);
    cancelBtn1.addEventListener('click', cancelProfileEdit);
    
    editBtn2.addEventListener('click', toggleEditPasswordMode);
    saveBtn2.addEventListener('click', savePassword);
    cancelBtn2.addEventListener('click', cancelPasswordEdit);
    setupPasswordVisibilityToggle();
}

// Toggle edit profile mode
function toggleEditProfileMode() {
    isEditProfileMode = !isEditProfileMode;

    const formInputs = profileForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = !isEditProfileMode;
    });

    if (isEditProfileMode) {
        editBtn1.style.display = 'none';
        saveBtn1.style.display = 'block';
        cancelBtn1.style.display = 'block';
        profileMessageDiv.textContent = '';
        profileMessageDiv.className = 'message';
    } else {
        editBtn1.style.display = 'block';
        saveBtn1.style.display = 'none';
        cancelBtn1.style.display = 'none';
    }
}

// Toggle edit password mode
function toggleEditPasswordMode() {
    isEditPasswordMode = !isEditPasswordMode;

    const formInputs = passwordForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = !isEditPasswordMode;
    });

    if (isEditPasswordMode) {
        editBtn2.style.display = 'none';
        saveBtn2.style.display = 'block';
        cancelBtn2.style.display = 'block';
        passwordMessageDiv.textContent = '';
        passwordMessageDiv.className = 'message';
    } else {
        editBtn2.style.display = 'block';
        saveBtn2.style.display = 'none';
        cancelBtn2.style.display = 'none';
        setPasswordInputsType('password');
    }
}

function setPasswordInputsType(type) {
    const passwordInputs = passwordForm.querySelectorAll('input[id^="contraseña-"]');
    passwordInputs.forEach(input => {
        input.type = type;
    });

    const iconSrc = type === 'password'
        ? '/Images/Common/eye-icon-hidden-white.png'
        : '/Images/Common/eye-icon-visible-white.png';
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
                ? '/Images/Common/eye-icon-visible-white.png'
                : '/Images/Common/eye-icon-hidden-white.png';
            icon.alt = show ? 'Ocultar contraseña' : 'Mostrar contraseña';
            toggle.setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
        });
    });
}

// Save profile changes
async function saveProfile() {
    try {
        if (!validateProfileForm()) {
            return;
        }

        const userData = {
            nombre: document.getElementById('nombre').value.trim(),
            mail: document.getElementById('email').value.trim(),
            dni: document.getElementById('dni').value.trim(),
            contraseña: document.getElementById('contraseña-actual').value,
            nacimiento: document.getElementById('nacimiento').value,
            telefono: document.getElementById('telefono').value.trim(),
            genero: document.getElementById('genero').value
        };

        // TODO: Send update request
        /*
        const response = await fetch('/api/usuario/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el perfil');
        }

        const updatedUser = await response.json();
        */

        const updatedUser = userData;
        populateProfileForm(updatedUser);
        storeOriginalValues();

        // Exit edit profile mode
        isEditProfileMode = true;
        toggleEditProfileMode();

        showMessage('Perfil actualizado exitosamente', 'success', 'profileMessage');

        // Clear message after 3 seconds
        setTimeout(() => {
            profileMessageDiv.textContent = '';
            profileMessageDiv.className = 'message';
        }, 3000);

    } catch (error) {
        showMessage('Error: ' + error.message, 'error', 'profileMessage');
        console.error('Error:', error);
    }
}

// Save new password
async function savePassword() {
    try {
        if (!validatePasswordForm()) {
            return;
        }

        const userData = {
            // mail: document.getElementById('email').value.trim(),
            contraseña: document.getElementById('contraseña-nueva').value,
        };

        // TODO: Send update request
        /*
        const response = await fetch('/api/usuario/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el perfil');
        }

        const updatedUser = await response.json();
        */

        const updatedUser = userData;
        resetPasswordForm();

        // Exit edit password mode
        isEditPasswordMode = true;
        toggleEditPasswordMode();

        showMessage('Contraseña actualizada exitosamente', 'success', 'passwordMessage');

        // Clear message after 3 seconds
        setTimeout(() => {
            passwordMessageDiv.textContent = '';
            passwordMessageDiv.className = 'message';
        }, 3000);

    } catch (error) {
        showMessage('Error: ' + error.message, 'error', 'passwordMessage');
        console.error('Error:', error);
    }
}

// Cancel profile edit
function cancelProfileEdit() {
    // Restore original values
    Object.keys(originalValues).forEach(key => {
        const fieldMap = {
            'email': 'email',
            'nombre': 'nombre',
            'dni': 'dni',
            'nacimiento': 'nacimiento',
            'telefono': 'telefono',
            'genero': 'genero'
        };

        const elementId = fieldMap[key] || key;
        document.getElementById(elementId).value = originalValues[key];
    });

    // Exit edit mode
    isEditProfileMode = true;
    toggleEditProfileMode();

    showMessage('Cambios cancelados', 'info', 'profileMessage');

    setTimeout(() => {
        profileMessageDiv.textContent = '';
        profileMessageDiv.className = 'message';
    }, 2000);
}

// Cancel password edit
function cancelPasswordEdit() {
    // Restore original values
    resetPasswordForm();

    // Exit edit mode
    isEditPasswordMode = true;
    toggleEditPasswordMode();

    showMessage('Cambios cancelados', 'info', 'passwordMessage');

    setTimeout(() => {
        passwordMessageDiv.textContent = '';
        passwordMessageDiv.className = 'message';
    }, 2000);
}

// Validate profile form
function validateProfileForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const nacimiento = document.getElementById('nacimiento').value;
    const telefono = document.getElementById('telefono').value.trim();
    const genero = document.getElementById('genero').value;

    // Validate required fields
    if (!nombre || !email || !dni || !nacimiento || !telefono || !genero) {
        showMessage('Por favor completa todos los campos', 'error', 'profileMessage');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un email válido', 'error', 'profileMessage');
        return false;
    }

    // Validate DNI format (basic validation)
    if (dni.length < 7 || dni.length > 10) {
        showMessage('DNI inválido', 'error', 'profileMessage');
        return false;
    }

    // Validate date of birth (minimum 14 years old)
    if (nacimiento && new Date(nacimiento) > fechaMax) {
        showMessage('Fecha de nacimiento no válida', 'error', 'profileMessage');
        return false;
    }

    // Validate phone (basic validation)
    if (telefono.length < 7 || telefono.length > 15) {
        showMessage('Teléfono inválido', 'error', 'profileMessage');
        return false;
    }

    return true;
}

// Validate password form
function validatePasswordForm() {
    const contraseñaActual = document.getElementById('contraseña-actual').value;
    const contraseñaNueva = document.getElementById('contraseña-nueva').value;
    const contraseñaConfirmar = document.getElementById('contraseña-confirmar').value;
    
    // Validate password change
    // TODO: Replace mock password validation with real backend validation
    if (contraseñaActual !== mockPassword) {
        showMessage('Las contraseña actual es incorrecta', 'error', 'passwordMessage');
        return false;
    }

    if (contraseñaNueva !== contraseñaConfirmar) {
        showMessage('Las contraseñas no coinciden', 'error', 'passwordMessage');
        return false;
    }
    
    if (!contraseñaNueva || (contraseñaNueva && contraseñaNueva.length < 6)) {
        showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error', 'passwordMessage');
        return false;
    }

    return true;
}

// Show message
function showMessage(message, type, id) {
    const messageDiv = document.getElementById(id);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}