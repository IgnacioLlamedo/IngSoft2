const cancellationsClassBtn = document.getElementById('cancellationsClassBtn');
const tableBody = document.getElementById('statsTableBody');
const statsMsgDiv = document.getElementById('statsMessage');
const table = document.getElementById('statsTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');


let currentStats = [];
const currentSort = { key: null, direction: 'asc' };
// DEBUG: Activar para ver datos de prueba
let testing = true;

window.addEventListener('DOMContentLoaded', () => {
    cancellationsClassBtn.classList.add("btn-active");
    bindSortButtons();
    bindFilterControls();
    loadStats();
});


function bindFilterControls() {
    filterSelect.addEventListener('change', applyFiltersAndRender);
    filterInput.addEventListener('input', applyFiltersAndRender);

    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', () => {
            filterInput.value = '';
            filterSelect.value = 'clase';
            applyFiltersAndRender();
        });
    }
}


function getFilteredStats() {
    if (!filterInput || !filterSelect) return currentStats;

    const searchValue = filterInput.value.trim().toLowerCase();
    const searchKey = filterSelect.value;

    return currentStats.filter((payment) => {
        // Filtrado por texto
        if (searchValue) {
            const fieldValue = String(payment[searchKey] || '').toLowerCase();
            if (!fieldValue.includes(searchValue)) return false;
        }

        return true;
    });
}


function applyFiltersAndRender() {
    renderStatsTable(getFilteredStats());
}


async function loadStats() {
    try {
        const response = await fetch('/api/reservas/get-cancellations', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('No se pudieron cargar las estadísticas.');
        }

        const stats = await response.json();
        currentStats = Array.isArray(stats) ? stats : [];
        if (testing) {
            if (currentStats[0]) {
                currentStats[0].reservas = 25;
                currentStats[0].cancelaciones = 25;
            }
            if (currentStats[1]) {
                currentStats[1].reservas = 8;
                currentStats[1].cancelaciones = 0;
            }
            if (currentStats[2]) {
                currentStats[2].reservas = 15;
                currentStats[2].cancelaciones = 5;
            }
        }
        renderStatsTable(getFilteredStats());
    } catch (error) {
        showMessage(error.message, 'error', 'statsMessage');
        console.error(error);
    }
}


function renderStatsTable(generalClasses) {
    tableBody.innerHTML = '';

    if (!generalClasses.length) {
        return showMessage('No se encontraron clases.', 'info', 'statsMessage');
    }

    statsMsgDiv.textContent = '';
    statsMsgDiv.className = 'message';

    const sortedGeneralClasses = currentSort.key ? sortStats(generalClasses, currentSort.key, currentSort.direction) : generalClasses;
    updateSortIndicators();

    tableBody.innerHTML = sortedGeneralClasses
        .map((gc) => {
            const porcentaje = (gc.reservas === 0)
                ? '0'
                : (gc.cancelaciones / gc.reservas * 100).toFixed(2);
            return `
                <tr>
                    <td>${escapeHtml(gc.id)}</td>
                    <td>${escapeHtml(gc.clase)}</td>
                    <td>${escapeHtml(gc.profesor)}</td>
                    <td>${escapeHtml(gc.reservas)}</td>
                    <td>${escapeHtml(gc.cancelaciones)} (${porcentaje}% de las reservas)</td>
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
