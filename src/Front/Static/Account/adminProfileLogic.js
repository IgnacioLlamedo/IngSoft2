const profileContainer = document.getElementById('profileContainer');
const profileForm = document.getElementById('profileForm');
const profileEditBtn = document.getElementById('profileEditBtn');
const profileSaveBtn = document.getElementById('profileSaveBtn');
const profileCancelBtn = document.getElementById('profileCancelBtn');
const profileMessageDiv = document.getElementById('profileMessage');

const userStatusCard = document.getElementById('userStatusCard');
const userStatus = document.getElementById('userStatus');
const reasonContainer = document.getElementById('reasonContainer');
const userStatusReason = document.getElementById('userStatusReason');

let originalValues = {};
let Status;
let isEditProfileMode = false;
let userSessionData;
let currentStatus;
let userId;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profileForm');
    userId = profileForm.dataset.userId;
    Status = JSON.parse(profileContainer.dataset.statusEnum);
    getSessionData();
    loadProfile(userId);
    setupProfileEventListeners();
});

async function getSessionData() {
    const response = await fetch("/session-data");
    if (!response.ok) {
            throw new Error('Error al cargar información del usuario.');
        }
    const sessionData = await response.json();
    userSessionData = sessionData.session;
}

// Load user profile data
async function loadProfile(userId) {
    console.log('DEBUG: Cargando perfil del id:', userId);
    try {
        const url = `/api/load-profile?id=${encodeURIComponent(userId)}`;

        const response = await fetch(url, {
            method: 'GET',
            credentials: 'include' // Include session cookies
        });
     
        if (!response.ok) {
            throw new Error('Error al cargar el perfil');
        }
        const userData = await response.json();
        
        populateStatusCard(userData);
        populateProfileForm(userData);
        storeOriginalValues();

    } catch (error) {
        showProfileMessage('Error al cargar el perfil: ' + error.message, 'error', 'profileMessage');
        console.error('Error:', error);
    }
}

function populateStatusCard(userData) {
    if (!userData.motivoEstado) userData.motivoEstado = 'Sin motivo especificado';
    if (!userData.estado) userData.estado = Status.REGISTERED;
    if (userData._id === userSessionData.id || !userData.estado) return;

    userStatusCard.style.display = 'block';
    userStatus.textContent = currentStatus = userData.estado;
    userStatusReason.textContent = `"${userData.motivoEstado}"`;

    if (userData.estado === Status.REGISTERED) userStatus.className = 'text-registered';
    else {
        reasonContainer.style.display = 'inline';
        if (userData.estado === Status.INACTIVE) userStatus.className = 'text-inactive';
        else if (userData.estado === Status.UNVERIFIED) userStatus.className = 'text-unverified';
        else if (userData.estado === Status.DELETED) userStatus.className = 'text-deleted';
    }
}

function populateProfileForm(userData) {
    document.getElementById('nombre').value = userData.nombre || '';
    document.getElementById('email').value = userData.mail || '';
    document.getElementById('dni').value = userData.dni || '';
    
    if (userData.estado === Status.DELETED || userData._id !== userSessionData.id)
        profileEditBtn.style.display = 'none';
    else profileEditBtn.style.display = 'block';
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
    if (currentStatus === Status.DELETED) return;

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
            id: userId,
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
        showProfileMessage(error.message, 'error', 'profileMessage');
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