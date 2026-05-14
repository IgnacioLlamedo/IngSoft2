// Get DOM elements
const profileForm = document.getElementById('profileForm');
const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const messageDiv = document.getElementById('message');

// Mock password
const mockPassword = '123456';

// Store original values for cancellation
let originalValues = {};
let isEditMode = false;

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
           
        populateForm(userData);
        storeOriginalValues();

    } catch (error) {
        showMessage('Error al cargar el perfil: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Populate form with user data
function populateForm(userData) {

    document.getElementById('nombre').value = userData.nombre || '';
    document.getElementById('email').value = userData.mail || '';
    document.getElementById('dni').value = userData.dni || '';
    document.getElementById('contraseña-actual').value = '';
    document.getElementById('contraseña-nueva').value = '';
    document.getElementById('contraseña-confirmar').value = '';

    // Format date for date input (AAAA-MM-DD)
    if (userData.nacimiento) {
        const date = new Date(userData.nacimiento);
        const formattedDate = date.toISOString().split('T')[0];
        document.getElementById('nacimiento').value = formattedDate;
    }

    document.getElementById('telefono').value = userData.telefono || '';
    document.getElementById('genero').value = userData.genero || '';
}

// Store original values for cancellation
function storeOriginalValues() {
    originalValues = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        dni: document.getElementById('dni').value,
        contraseña: document.getElementById('contraseña-actual').value,
        nacimiento: document.getElementById('nacimiento').value,
        telefono: document.getElementById('telefono').value,
        genero: document.getElementById('genero').value
    };
}

// Setup event listeners
function setupEventListeners() {
    editBtn.addEventListener('click', toggleEditMode);
    saveBtn.addEventListener('click', saveProfile);
    cancelBtn.addEventListener('click', cancelEdit);
}

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;

    const formInputs = profileForm.querySelectorAll('input, select');
    formInputs.forEach(input => {
        input.disabled = !isEditMode;
    });

    if (isEditMode) {
        editBtn.style.display = 'none';
        saveBtn.style.display = 'block';
        cancelBtn.style.display = 'block';
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    } else {
        editBtn.style.display = 'block';
        saveBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
    }
}

// Save profile changes
async function saveProfile() {
    try {
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Prepare data
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
        populateForm(updatedUser);
        storeOriginalValues();

        // Exit edit mode
        isEditMode = true;
        toggleEditMode();

        showMessage('Perfil actualizado exitosamente', 'success');

        // Clear message after 3 seconds
        setTimeout(() => {
            messageDiv.textContent = '';
            messageDiv.className = 'message';
        }, 3000);

    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
        console.error('Error:', error);
    }
}

// Cancel edit
function cancelEdit() {
    // Restore original values
    Object.keys(originalValues).forEach(key => {
        const fieldMap = {
            'email': 'email',
            'nombre': 'nombre',
            'dni': 'dni',
            'contraseña': 'contraseña-actual',
            'nacimiento': 'nacimiento',
            'telefono': 'telefono',
            'genero': 'genero'
        };

        const elementId = fieldMap[key] || key;
        document.getElementById(elementId).value = originalValues[key];
    });

    // Exit edit mode
    isEditMode = true;
    toggleEditMode();

    showMessage('Cambios cancelados', 'info');

    setTimeout(() => {
        messageDiv.textContent = '';
        messageDiv.className = 'message';
    }, 2000);
}

// Validate form
function validateForm() {
    const nombre = document.getElementById('nombre').value.trim();
    const email = document.getElementById('email').value.trim();
    const dni = document.getElementById('dni').value.trim();
    const contraseñaActual = document.getElementById('contraseña-actual').value;
    const contraseñaNueva = document.getElementById('contraseña-nueva').value;
    const contraseñaConfirmar = document.getElementById('contraseña-confirmar').value;
    const nacimiento = document.getElementById('nacimiento').value;
    const telefono = document.getElementById('telefono').value.trim();
    const genero = document.getElementById('genero').value;

    // Validate required fields
    if (!nombre || !email || !dni || !nacimiento || !telefono || !genero) {
        showMessage('Por favor completa todos los campos', 'error');
        return false;
    }

    // Validate password change
    // TODO: Replace mock password validation with real backend validation
    if (contraseñaActual !== '' && contraseñaActual !== mockPassword) {
        showMessage('Las contraseña actual es incorrecta', 'error');
        return false;
    }

    if (contraseñaNueva !== contraseñaConfirmar || (contraseñaActual && !contraseñaNueva)) {
        showMessage('Las contraseñas no coinciden', 'error');
        return false;
    }
    
    if (contraseñaNueva && contraseñaNueva.length < 6) {
        showMessage('La nueva contraseña debe tener al menos 6 caracteres', 'error');
        return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showMessage('Por favor ingresa un email válido', 'error');
        return false;
    }

    // Validate DNI format (basic validation)
    if (dni.length < 7 || dni.length > 10) {
        showMessage('DNI inválido', 'error');
        return false;
    }

    // Validate phone (basic validation)
    if (telefono.length < 7 || telefono.length > 15) {
        showMessage('Teléfono inválido', 'error');
        return false;
    }

    return true;
}

// Show message
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}