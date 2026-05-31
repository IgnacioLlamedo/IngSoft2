const tableBody = document.getElementById('userlistTableBody');
const messageDiv = document.getElementById('userlistMessage');

window.addEventListener('DOMContentLoaded', loadUsers);

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
        renderUserTable(Array.isArray(users) ? users : []);
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

    tableBody.innerHTML = users
        .map((user) => {
            // const fechaNac = user.nacimiento ? new Date(user.nacimiento).toLocaleDateString() : '';
            return `
                <tr>
                    <td>${escapeHtml(user.nombre)}</td>
                    <td>${escapeHtml(user.mail)}</td>
                    <td>${escapeHtml(user.rol)}</td>
                    <td class="actions-cell">
                        <button class="action-btn btn-view" data-id="${escapeHtml(user._id)}">Ver/Editar Perfil</button>
                        <button class="action-btn btn-delete" data-id="${escapeHtml(user._id)}">Dar de Baja</button>
                    </td>
                </tr>`;
        })
        .join('');
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
