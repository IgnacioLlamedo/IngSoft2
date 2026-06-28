const employeesBtn = document.getElementById('employeesBtn');
const employeesSubBtn = document.getElementById('employeesSubBtn');
const tableBody = document.getElementById('userlistTableBody');
const userlistMsgDiv = document.getElementById('userlistMessage');
const deleteMsgDiv = document.getElementById('deleteMessage');
const deleteDialogForm = document.getElementById('deleteDialogForm');
const table = document.getElementById('userlistTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');
const showDeletedCheckbox = document.getElementById('showDeletedCheckbox');
const deleteDialog = document.getElementById('deleteUserDialog');
const deleteUserMail = document.getElementById('deleteUserMail');
const deletionReasonInput = document.getElementById('deletionReasonInput');
const confirmDelBtn = document.getElementById('confirmDelBtn');
const cancelDelBtn = document.getElementById('cancelDelBtn');
const statsDiv = document.getElementById('userStats');

let Role;
let Status;
let userData;
let currentUsers = [];
const currentSort = { key: null, direction: 'asc' };
let pendingDeleteId = null;
let pendingDeleteMail = null;

window.addEventListener('DOMContentLoaded', () => {
    employeesBtn.classList.add("btn-active");
    employeesSubBtn.classList.add("btn-active");
    Status = JSON.parse(table.dataset.statusEnum);
    Role = JSON.parse(table.dataset.roleEnum);
    getSessionData();
    bindSortButtons();
    bindFilterControls();
    bindDeleteDialogControls();
    loadUsers();
});


async function getSessionData() {
    const response = await fetch("/session-data");
    if (!response.ok) {
            throw new Error('Error al cargar información del usuario.');
        }
    const sessionData = await response.json();
    userData = sessionData.session;
}

function bindFilterControls() {
    if (filterSelect) {
        filterSelect.addEventListener('change', applyFiltersAndRender);
    }

    if (filterInput) {
        filterInput.addEventListener('input', applyFiltersAndRender);
    }

    if (showDeletedCheckbox) {
        showDeletedCheckbox.addEventListener('change', applyFiltersAndRender);
    }

    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', () => {
            if (filterInput) filterInput.value = '';
            if (filterSelect) filterSelect.value = 'nombre';
            if (showDeletedCheckbox) showDeletedCheckbox.checked = false;
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
        return applyDeletedFilter(currentUsers);
    }

    return applyDeletedFilter(currentUsers.filter((user) => {
        const fieldValue = String(user[searchKey] || '').toLowerCase();
        return fieldValue.includes(searchValue);
    }));
}

function applyDeletedFilter(users) {
    if (showDeletedCheckbox && !showDeletedCheckbox.checked) {
        const Status = JSON.parse(table.dataset.statusEnum);
        return users.filter((user) => user.estado !== Status.DELETED);
    }
    return users;
}

function applyFiltersAndRender() {
    renderUserTable(getFilteredUsers());
}


document.addEventListener('click', (event) => {
    const viewBtn = event.target.closest('.btn-view');
    const deleteBtn = event.target.closest('.btn-delete');

    if (viewBtn) {
        const userId = viewBtn.dataset.id;
        openUserProfile(userId);
    }

    if (deleteBtn) {
        const userId = deleteBtn.dataset.id;
        const userMail = deleteBtn.dataset.mail;
        openDeleteDialog(userId, userMail);
    }
});

async function loadUsers() {
    try {
        const response = await fetch(`/api/get-userlist?role=${Role.EMPLOYEE}`, { credentials: 'include' });
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
    
    const sortedUsers = currentSort.key ? sortUsers(users, currentSort.key, currentSort.direction) : users;
    updateSortIndicators();
    
    tableBody.innerHTML = sortedUsers
		.map((user) => {
			const userDataCellsHtml = `
                <td>${escapeHtml(user.nombre)}</td>
                <td>${escapeHtml(user.mail)}</td>
                <td>${escapeHtml(user.dni)}</td>
                <td>${escapeHtml(user.estado)}</td>
            `;

            let trClass = '';
            switch (user.estado) {
                case Status.INACTIVE: trClass = 'class="row-inactive"'; break;
                case Status.UNVERIFIED: trClass = 'class="row-unverified"'; break;
                case Status.DELETED: trClass = 'class="row-deleted"'; break;
            }

            let viewBtnText;
            if (user._id === userData.id) viewBtnText = "Ver Mi Perfil";
            else if (user.estado === Status.DELETED || user.rol === Role.ADMIN) viewBtnText = "Ver Perfil";
            else viewBtnText = "Ver/Editar Perfil";

            const disabledAttr = (user.estado === Status.DELETED || user.rol === Role.ADMIN) ? 'disabled' : '';
            const deleteBtnText = "Dar de Baja";

            const userHtmlActionsCell = `
                <td class="actions-cell">
                    <button class="btn-action btn-view" data-id="${escapeHtml(user._id)}" data-rol="${escapeHtml(user.rol)}" data-mail="${escapeHtml(user.mail)}">${viewBtnText}</button>
                    <button class="btn-action btn-delete" data-id="${escapeHtml(user._id)}" data-rol="${escapeHtml(user.rol)}" data-mail="${escapeHtml(user.mail)}" ${disabledAttr}>${deleteBtnText}</button>
                </td>
            `;

            return `
                <tr ${trClass}>
                    ${userDataCellsHtml}
                    ${userHtmlActionsCell}
                </tr>
            `;            
		})
		.join('');
        
        if (statsDiv) {
            const regRoleCounts = {};
            const roleValues = Object.values(Role);
            roleValues.forEach(r => regRoleCounts[r] = 0);

            const statusCounts = {};
            const statusValues = Object.values(Status);
            statusValues.forEach(s => statusCounts[s] = 0);

            currentUsers.forEach(u => {
                if (u.estado === Status.REGISTERED || u.estado === Status.INACTIVE)
                    regRoleCounts[u.rol]++;
                statusCounts[u.estado]++;
            }); 

            const registeredCount = statusCounts[Status.REGISTERED] + statusCounts[Status.INACTIVE];

            const separator = "    &middot    ";
            statsDiv.innerHTML = `
                El sistema cuenta con <span class="stat-role stat-role-client stat-count stat-registered">${registeredCount}</span> empleados registrados.` +
                `<span>&nbsp;</span>
                Además, existen <span class="stat-count stat-registered stat-status stat-status-unverified">${statusCounts[Status.UNVERIFIED] || 0}</span> empleados sin verificar y <span class="stat-count stat-registered stat-status stat-status-deleted">${statusCounts[Status.DELETED] || 0}</span> empleados eliminados.
            `;
        }
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
        confirmDelBtn.disabled = true;
        try {
            await deleteUser(pendingDeleteId);
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
                confirmDelBtn.disabled = false;
            }, 3000);
            pendingDeleteId = pendingDeleteMail = null;
        }
    });

    cancelDelBtn.addEventListener('click', () => {
        if (!deleteDialog) return;
        deleteDialog.close();
        pendingDeleteMail = null;
    });
}

function openDeleteDialog(id, mail) {
    if (!id || !mail || !deleteDialog || !deleteUserMail) return;
    pendingDeleteId = id;
    pendingDeleteMail = mail;
    deleteUserMail.textContent = mail;
    if (deletionReasonInput) {
        deletionReasonInput.value = '';
        deletionReasonInput.focus();
    }
    deleteDialog.showModal();
}

async function deleteUser(id) {
    if (!id) return;

    const reason = deletionReasonInput ? deletionReasonInput.value.trim() : '';
    // console.log(`El motivo de baja ingresado es: "${reason}"`);
    const response = await fetch('/api/delete-user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
            id: id,
            motivoEstado: reason || 'Sin motivo especificado'
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error desconocido.');
    }

    showMessage('Usuario dado de baja exitosamente.', 'success', 'deleteMessage');
    await loadUsers();
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

async function openUserProfile(userId) {
    if (!userId) return;
    if (userId === userData.id) window.location.href = '/account';
    else window.location.href = `/profile/${encodeURIComponent(userId)}`;
}
