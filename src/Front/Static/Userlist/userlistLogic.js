const tableBody = document.getElementById('userlistTableBody');
const messageDiv = document.getElementById('userlistMessage');
const table = document.getElementById('userlistTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');

let currentUsers = [];
const currentSort = { key: null, direction: 'asc' };

window.addEventListener('DOMContentLoaded', () => {
    bindSortButtons();
    bindFilterControls();
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
        alert(`Ver usuario: ${viewBtn.dataset.id} (placeholder)`);
    }

    if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (confirm(`Desea dar de baja al usuario ${id}? (placeholder)`)) {
            alert('Usuario dado de baja. (mentira)');
        }
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
        showMessage(error.message, 'error');
        console.error(error);
    }
}

function renderUserTable(users) {
    tableBody.innerHTML = '';

    if (!users.length) {
        return showMessage('No se encontraron usuarios.', 'info');
    }

    messageDiv.textContent = '';
    messageDiv.className = 'message';
    
    // TODO1: Acciones especiales en la fila del propio usuario
    // 1) Utilizar la ruta "/account" para el botón "Ver/editar perfil"
    // 2) No mostrar botón "Borrar"

    // TODO2: Realizar borrado lógico
    // 1) Se podría crear un nuevo campo en la bd, tipo borrado: true/false
    // 2) El botón "Ver/editar perfil" sería solo "Ver perfil"
    // 3) No mostrar botón "Borrar"

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
                        <button class="btn-action btn-view" data-id="${escapeHtml(user._id)}">Ver/Editar Perfil</button>
                        <button class="btn-action btn-delete" data-id="${escapeHtml(user._id)}">Dar de Baja</button>
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
        button.setAttribute('aria-sort', isActive ? (currentSort.direction === 'asc' ? 'ascending' : 'descending') : 'none');
        indicator.textContent = isActive ? (currentSort.direction === 'asc' ? '▲' : '▼') : '';
    });
}

function showMessage(message, type = 'info') {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
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
