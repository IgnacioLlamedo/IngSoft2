const tableBody = document.getElementById('userlistTableBody');
const userlistMsgDiv = document.getElementById('userlistMessage');
const deleteMsgDiv = document.getElementById('deleteMessage');
const deleteDialogForm = document.getElementById('deleteDialogForm');
const table = document.getElementById('userlistTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');
const deleteDialog = document.getElementById('deleteUserDialog');
const deleteUserMail = document.getElementById('deleteUserMail');
const deleteUserRole = document.getElementById('deleteUserRole');
const deletionReasonInput = document.getElementById('deletionReasonInput');
const confirmDelBtn = document.getElementById('confirmDelBtn');
const cancelDelBtn = document.getElementById('cancelDelBtn');

let currentUsers = [];
const currentSort = { key: null, direction: 'asc' };
let pendingDeleteId = null;
let pendingDeleteMail = null;
let pendingDeleteRole = null;

window.addEventListener('DOMContentLoaded', () => {
    bindSortButtons();
    bindFilterControls();
    bindDeleteDialogControls();
    loadUsers();
});

function bindFilterControls() {
    if (filterSelect) {
        filterSelect.addEventListener('change', applyFiltersAndRender);
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFiltersAndRender);
    }

    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', () => {
            if (filterInput) filterInput.value = '';
            if (filterSelect) filterSelect.value = 'nombre';
            applyFiltersAndRender();
        });
    }
}

function getFilteredUsers() {
    if (!filterInput || !filterSelect) {
        return currentUsers;
    }

    const searchValue = filterInput.value.trim().toLowerCase();
    const searchKey = filterSelect.value;

    if (!searchValue) {
        return currentUsers;
    }

    return currentUsers.filter((user) => {
        const fieldValue = String(user[searchKey] || '').toLowerCase();
        return fieldValue.includes(searchValue);
    });
}

function applyFiltersAndRender() {
    renderUserTable(getFilteredUsers());
}


document.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.btn-view');
    const deleteBtn = event.target.closest('.btn-delete');

    if (viewBtn) {
        // const userId = viewBtn.dataset.id;
        const userMail = viewBtn.dataset.mail;
        const userRole = viewBtn.dataset.rol;
        openUserProfile(userMail, userRole);
    }

    if (deleteBtn) {
        const userId = deleteBtn.dataset.id;
        const userMail = deleteBtn.dataset.mail;
        const userRole = deleteBtn.dataset.rol;
        openDeleteDialog(userId, userMail, userRole);
    }
});

async function loadUsers() {
    try {
        const response = await fetch('/api/get-userlist', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('No se pudo cargar la lista de usuarios.');
        }

        const users = await response.json();
        currentUsers = Array.isArray(users) ? users : [];
        renderUserTable(getFilteredUsers());
    } catch (error) {
        showMessage(error.message, 'error', 'userlistMessage');
        console.error(error);
    }
}

function renderUserTable(users) {
    tableBody.innerHTML = '';

    if (!users.length) {
        return showMessage('No se encontraron usuarios.', 'info', 'userlistMessage');
    }

    userlistMsgDiv.textContent = '';
    userlistMsgDiv.className = 'message';
    
    // TODO1: Acciones especiales en la fila del propio usuario
    // 1) Utilizar la ruta "/account" para el botón "Ver/editar perfil"
    // 2) No mostrar botón "Borrar"

    // TODO2: Realizar borrado lógico
    // 1) Hecho: Creado un nuevo campo en la bd para su estado (borrado, etc) + motivo
    // 2) No mostrar botón "Borrar" si ya están borrados
    // 3) Agregar columna "estado" a la tabla
    // 4) Agregar como opción al realizar búsqueda de filtro
    // 5) Agregar algún estilo que los distinga en la tabla
    // 6) Asegurarse que se vea correctamente el motivo

    // TODO3: Impedir borrado de clientes anotados a alguna clase

    const sortedUsers = currentSort.key ? sortUsers(users, currentSort.key, currentSort.direction) : users;
    updateSortIndicators();

    tableBody.innerHTML = sortedUsers
        .map((user) => {
            return `
                <tr>
                    <td>${escapeHtml(user.nombre)}</td>
                    <td>${escapeHtml(user.mail)}</td>
                    <td>${escapeHtml(user.dni)}</td>
                    <td>${escapeHtml(user.rol)}</td>
                    <td class="actions-cell">
                        <button class="btn-action btn-view" data-id="${escapeHtml(user._id)}" data-rol="${escapeHtml(user.rol)}" data-mail="${escapeHtml(user.mail)}">Ver/Editar Perfil</button>
                        <button class="btn-action btn-delete" data-id="${escapeHtml(user._id)}" data-rol="${escapeHtml(user.rol)}" data-mail="${escapeHtml(user.mail)}">Dar de Baja</button>
                    </td>
                </tr>`;
        })
        .join('');
}

function bindSortButtons() {
    const buttons = table.querySelectorAll('.btn-sort');
    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const key = button.dataset.sortKey;
            if (!key) return;

            if (currentSort.key === key) {
                currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.key = key;
                currentSort.direction = 'asc';
            }
            renderUserTable(getFilteredUsers());
        });
    });
}

function sortUsers(users, key, direction) {
    return [...users].sort((a, b) => {
        const left = String(a[key] || '').toLowerCase();
        const right = String(b[key] || '').toLowerCase();
        const comparison = left.localeCompare(right, 'es', { sensitivity: 'base' });
        return direction === 'asc' ? comparison : -comparison;
    });
}

function updateSortIndicators() {
    const buttons = table.querySelectorAll('.btn-sort');
    buttons.forEach((button) => {
        const indicator = button.querySelector('.sort-indicator');
        const key = button.dataset.sortKey;
        const isActive = currentSort.key === key;

        button.classList.toggle('active', isActive);
        indicator.textContent = isActive ? (currentSort.direction === 'asc' ? '▲' : '▼') : '';
    });
}


function showMessage(message, type = 'info', id) {
    const messageDiv = document.getElementById(id);
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
}


function bindDeleteDialogControls() {
    if (!deleteDialog) return;

    confirmDelBtn.addEventListener('click', async () => {
        try {
            await deleteUser(pendingDeleteId, pendingDeleteMail, pendingDeleteRole);
        } catch (err) {
            showMessage('Error al eliminar usuario: ' + err.message, 'error', 'deleteMessage');
            console.error('Error al eliminar usuario:', err);
        } finally {
            deleteDialogForm.style.display = 'none';
            if (deleteDialog) setTimeout(() => {                
                deleteMsgDiv.textContent = '';
                deleteMsgDiv.className = 'message';
                deleteDialogForm.style.display = 'grid';
                deleteDialog.close();
            }, 3000);
            pendingDeleteId = pendingDeleteMail = pendingDeleteRole = null;
        }
    });

    cancelDelBtn.addEventListener('click', () => {
        if (!deleteDialog) return;
        deleteDialog.close();
        pendingDeleteId = pendingDeleteMail = pendingDeleteRole = null;
    });
}

function openDeleteDialog(id, mail, role) {
    if (!id || !mail || !role || !deleteDialog || !deleteUserMail || !deleteUserRole) return;
    pendingDeleteId = id;
    pendingDeleteMail = mail;
    pendingDeleteRole = role;
    deleteUserMail.textContent = mail;
    deleteUserRole.textContent = role;
    if (deletionReasonInput) {
        deletionReasonInput.value = '';
        deletionReasonInput.focus();
    }
    deleteDialog.showModal();
}

async function deleteUser(id, mail, role) {
    if (!mail) return;

    const reason = deletionReasonInput ? deletionReasonInput.value.trim() : '';
    // console.log(`El motivo de baja ingresado es: "${reason}"`);
    const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            mail: mail,
            motivoBorrado: reason || 'Sin motivo especificado'
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido.');
    }

    // Actualizar la tabla sin recargar página; falta probar
    showMessage('Usuario dado de baja exitosamente.', 'success', 'deleteMessage');
    currentUsers = currentUsers.filter((user) => user.mail !== mail);
    renderUserTable(getFilteredUsers());
}

function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

async function openUserProfile(userMail, userRole) {
	if (!userMail || !userRole) return;
    window.location.href = `/profile/${encodeURIComponent(userRole)}/${encodeURIComponent(userMail)}`;
}
