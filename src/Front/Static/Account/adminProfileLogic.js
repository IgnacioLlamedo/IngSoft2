const profileForm = document.getElementById('profileForm');
const profileEditBtn = document.getElementById('profileEditBtn');
const profileSaveBtn = document.getElementById('profileSaveBtn');
const profileCancelBtn = document.getElementById('profileCancelBtn');
const profileMessageDiv = document.getElementById('profileMessage');

let originalValues = {};
let isEditProfileMode = false;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    const userMail = profileForm.dataset.userMail;
    loadProfile(userMail);
    setupProfileEventListeners();
});

// Load user profile data
async function loadProfile(userMail) {
    console.log('Cargando perfil del email:', userMail);
    try {
        const url = `/api/load-profile?mail=${encodeURIComponent(userMail)}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include' // Include session cookies
        });
     
        if (!response.ok) {
            throw new Error('Error al cargar el perfil');
        }
        const userData = await response.json();
           
        populateProfileForm(userData);
        storeOriginalValues();

    } catch (error) {
        showProfileMessage('Error al cargar el perfil: ' + error.message, 'error', 'profileMessage');
        console.error('Error:', error);
    }
}

// Populate profile form with user data
function populateProfileForm(userData) {

    document.getElementById('nombre').value = userData.nombre || '';
    document.getElementById('email').value = userData.mail || '';
    document.getElementById('dni').value = userData.dni || '';
}

// Store original values for cancellation
function storeOriginalValues() {
    originalValues = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        dni: document.getElementById('dni').value,
    };
}

// Setup event listeners
function setupProfileEventListeners() {
    profileEditBtn.addEventListener('click', toggleEditProfileMode);
    profileSaveBtn.addEventListener('click', saveProfile);
    profileCancelBtn.addEventListener('click', cancelProfileEdit);
}

// Toggle edit profile mode
function toggleEditProfileMode() {
    isEditProfileMode = !isEditProfileMode;

    const formInputs = profileForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = !isEditProfileMode;
    });

    if (isEditProfileMode) {
        profileEditBtn.style.display = 'none';
        profileSaveBtn.style.display = 'block';
        profileCancelBtn.style.display = 'block';
        profileMessageDiv.textContent = '';
        profileMessageDiv.className = 'message';
    } else {
        profileEditBtn.style.display = 'block';
        profileSaveBtn.style.display = 'none';
        profileCancelBtn.style.display = 'none';
    }
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
        };

        const response = await fetch('/api/save-profile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                userData: userData,
                originalValues: originalValues
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Error al guardar el perfil');
        }

        const updatedUser = await response.json();
        populateProfileForm(updatedUser);
        storeOriginalValues();

        // Exit edit profile mode
        isEditProfileMode = true;
        toggleEditProfileMode();

        showProfileMessage('Perfil actualizado exitosamente', 'success', 'profileMessage');

        // Clear message after 3 seconds
        setTimeout(() => {
            profileMessageDiv.textContent = '';
            profileMessageDiv.className = 'message';
        }, 3000);

    } catch (error) {
        showProfileMessage('Error: ' + error.message, 'error', 'profileMessage');
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
        };

        const elementId = fieldMap[key] || key;
        document.getElementById(elementId).value = originalValues[key];
    });

    // Exit edit mode
    isEditProfileMode = true;
    toggleEditProfileMode();

    showProfileMessage('Cambios cancelados', 'info', 'profileMessage');

    setTimeout(() => {
        profileMessageDiv.textContent = '';
        profileMessageDiv.className = 'message';
    }, 2000);
}

// Validate profile form
function validateProfileForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const dni = document.getElementById('dni').value.trim();

    // Validate required fields
    if (!nombre || !email || !dni) {
        showProfileMessage('Por favor completa todos los campos', 'error', 'profileMessage');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showProfileMessage('Por favor ingresa un email válido', 'error', 'profileMessage');
        return false;
    }

    // Validate DNI format (basic validation)
    if (dni.length < 7 || dni.length > 10) {
        showProfileMessage('DNI inválido', 'error', 'profileMessage');
        return false;
    }
    
    return true;
}

// Show message
function showProfileMessage(message, type, id) {
    const messageDiv = document.getElementById(id);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}