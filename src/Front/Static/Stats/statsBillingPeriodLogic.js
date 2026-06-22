const billingPeriodBtn = document.getElementById('billingPeriodBtn');
const tableBody = document.getElementById('statsTableBody');
const statsMsgDiv = document.getElementById('statsMessage');
const table = document.getElementById('statsTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');
const filterFromDate = document.getElementById('filterFromDate');
const filterToDate = document.getElementById('filterToDate');


let currentStats = [];
const currentSort = { key: null, direction: 'asc' };
let hidePendingPayments = false;

window.addEventListener('DOMContentLoaded', () => {
    billingPeriodBtn.classList.add("btn-active");
    bindSortButtons();
    bindFilterControls();
    loadStats();
});


function bindFilterControls() {
    filterSelect.addEventListener('change', applyFiltersAndRender);
    filterInput.addEventListener('input', applyFiltersAndRender);
    filterFromDate.addEventListener('change', applyFiltersAndRender);
    filterToDate.addEventListener('change', applyFiltersAndRender);

    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', () => {
            filterInput.value = '';
            filterSelect.value = 'usuario';
            filterFromDate.value = '';
            filterToDate.value = '';
            applyFiltersAndRender();
        });
    }
}

// odio javascript y las zonas horarias
function getUTCDate(date) {
    // console.log("date: " + date);
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}


function getFilteredStats() {
    if (!filterInput || !filterSelect) return currentStats;

    const searchValue = filterInput.value.trim().toLowerCase();
    const searchKey = filterSelect.value;
    const fromDate = filterFromDate.value ? getUTCDate(new Date(filterFromDate.value)) : null;
    const toDate = filterToDate.value ? getUTCDate(new Date(filterToDate.value)) : null;
    // console.log("fromDate: " + fromDate + ", toDate: " + toDate);

    return currentStats.filter((payment) => {
        // Filtrado de pagos pendientes
        // TODO: Definir si filtrarlos o no
        if (hidePendingPayments && payment.pendiente) {
            return false;
        }

        // Filtrado por texto
        if (searchValue) {
            const fieldValue = String(payment[searchKey] || '').toLowerCase();
            if (!fieldValue.includes(searchValue)) return false;
        }

        // Filtrado por fechas
        if (fromDate || toDate) {
            const paymentDate = getUTCDate(new Date(payment.fecha));   

            if (isNaN(paymentDate.getTime())) return true;
            if (fromDate && paymentDate < fromDate) return false;
            if (toDate && paymentDate > toDate) return false;
        }
        
        // console.log(fromDate + " >= " + paymentDate + " >= " + toDate);
        return true;
    });
}


function applyFiltersAndRender() {
    renderStatsTable(getFilteredStats());
}


async function loadStats() {
    try {
        const response = await fetch('/api/pago/get-payments', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('No se pudieron cargar las estadísticas.');
        }

        const stats = await response.json();
        currentStats = Array.isArray(stats) ? stats : [];
        renderStatsTable(getFilteredStats());
    } catch (error) {
        showMessage(error.message, 'error', 'statsMessage');
        console.error(error);
    }
}

function renderStatsTable(payments) {
    tableBody.innerHTML = '';

    if (!payments.length) {
        return showMessage('No se encontraron pagos.', 'info', 'statsMessage');
    }

    statsMsgDiv.textContent = '';
    statsMsgDiv.className = 'message';
    
    const sortedUsers = currentSort.key ? sortStats(payments, currentSort.key, currentSort.direction) : payments;
    updateSortIndicators();

    const Status = JSON.parse(table.dataset.statusEnum);
    const Role = JSON.parse(table.dataset.roleEnum);
    
    tableBody.innerHTML = sortedUsers
		.map((payment) => {
            return `
                <tr>
                    <td>${escapeHtml(new Date(payment.fecha).toISOString().split("T")[0])}</td>
                    <td>${escapeHtml(payment.usuario)}</td>
                    <td>$${escapeHtml(payment.monto)}</td>
                    <td>${escapeHtml(payment.tipo)}</td>
                    <td>${escapeHtml(payment.clase)}</td>
                    <td>${escapeHtml(payment.actividad)}</td>
                </tr>
            `;
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
            renderStatsTable(getFilteredStats());
        });
    });
}


function sortStats(stats, key, direction) {
    return [...stats].sort((a, b) => {
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


function escapeHtml(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
