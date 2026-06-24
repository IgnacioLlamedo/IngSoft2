const subscriptionsActivityBtn = document.getElementById('subscriptionsActivityBtn');
const tableBody = document.getElementById('statsTableBody');
const statsMsgDiv = document.getElementById('statsMessage');
const table = document.getElementById('statsTable');
const filterSelect = document.getElementById('filterColumnSelect');
const filterInput = document.getElementById('filterInput');
const clearFilterButton = document.getElementById('clearFilterButton');
const chartContainer = document.getElementById('statsChart');

let currentStats = [];
const currentSort = { key: null, direction: 'asc' };

window.addEventListener('DOMContentLoaded', () => {
    subscriptionsActivityBtn.classList.add("btn-active");
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
            filterSelect.value = 'nombre';
            applyFiltersAndRender();
        });
    }
}


function getFilteredStats() {
    if (!filterInput || !filterSelect) return currentStats;

    const searchValue = filterInput.value.trim().toLowerCase();
    let searchKey = filterSelect.value;

    return currentStats.filter((activity) => {
        // Filtrado por texto
        if (searchValue) {
            const fieldValue = String(activity[searchKey] || '').toLowerCase();
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
        const response = await fetch('/api/admin/activities-stats', { credentials: 'include' });
        if (!response.ok) {
            throw new Error('No se pudieron cargar las estadísticas.');
        }

        const stats = await response.json();
        console.log("Estadísticas de actividades:",stats);
        currentStats = Array.isArray(stats) ? stats : [];
        renderStatsTable(getFilteredStats());
    } catch (error) {
        showMessage(error.message, 'error', 'statsMessage');
        console.error(error);
    }
}



function renderStatsTable(activities) {
    tableBody.innerHTML = '';

    if (!activities.length) {
        return showMessage('No se encontraron actividades.', 'info', 'statsMessage');
    }

    statsMsgDiv.textContent = '';
    statsMsgDiv.className = 'message';
    
    const sortedActivities = currentSort.key ? sortStats(activities, currentSort.key, currentSort.direction) : activities;
    updateSortIndicators();
    
    // TODO: Convendría agregar algún dato más!! Queda feo si la tabla y el gráfico muestran la misma información
    // El tema es qué mostrar, no se me ocurre nada que no deba ir ya en las otras stats 
    tableBody.innerHTML = sortedActivities
		.map((a) => {
            return `
                <tr>
                    <td>${escapeHtml(a.nombre)}</td>
                    <td>${escapeHtml(a.abonados)}</td>
                </tr>
            `;
        })
		.join('');

    renderChart(currentStats);
}

function renderChart(activities) {
    const chartActivities = activities.map((activity) => ({
        label: activity.nombre,
        value: activity.abonados,
    }));

    // TODO: Arreglar la parte del mensaje
    if (!chartActivities.length || chartActivities.length < 1) {
        chartContainer.innerHTML = '<div class="chart-empty">No existe información disponible.</div>';
        return;
    }

    const maxValue = Math.max(...chartActivities.map((item) => item.value), 1);

    chartContainer.innerHTML = chartActivities
        .map((item) => {
            const barHeight = item.value > 0
                ? Math.max(Math.round((item.value / maxValue) * 180), 50)
                : 10;
            return `
                <div class="chart-bar">
                    <div class="bar-wrapper" title="${escapeHtml(item.label)}: ${item.value}">
                        <div class="bar" style="height: ${barHeight}px"></div>
                    </div>
                    <div class="bar-value">${escapeHtml(item.value)}</div>
                    <div class="bar-label">${escapeHtml(item.label)}</div>
                </div>
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
