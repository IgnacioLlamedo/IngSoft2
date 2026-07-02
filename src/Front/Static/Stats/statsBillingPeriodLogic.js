const billingPeriodBtn = document.getElementById('billingPeriodBtn');
// const tableBody = document.getElementById('statsTableBody');
const chartPanel = document.getElementById('chartPanel');
const statsMsgDiv = document.getElementById('statsMessage');
const chartContainer = document.getElementById('statsChart');
const clearFilterButton = document.getElementById('clearFilterButton');
const filterFromDate = document.getElementById('filterFromDate');
const filterToDate = document.getElementById('filterToDate');
const statsReport = document.getElementById('statsReport');


let interval1, timeout2, timeout3;
let currentStats = [];
const currentSort = { key: null, direction: 'asc' };
let hidePendingPayments = false;

window.addEventListener('DOMContentLoaded', () => {
    billingPeriodBtn.classList.add("btn-active");
    // bindSortButtons();
    bindFilterControls();
    loadStats();
});


function bindFilterControls() {
    // filterSelect.addEventListener('change', applyFiltersAndRender);
    // filterInput.addEventListener('input', applyFiltersAndRender);
    filterFromDate.addEventListener('change', applyFiltersAndRender);
    filterToDate.addEventListener('change', applyFiltersAndRender);

    if (clearFilterButton) {
        clearFilterButton.addEventListener('click', () => {
            // filterInput.value = '';
            // filterSelect.value = 'usuario';
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
    // if (!filterInput || !filterSelect) return currentStats;

    // const searchValue = filterInput.value.trim().toLowerCase();
    // const searchKey = filterSelect.value;
    const fromDate = filterFromDate.value ? getUTCDate(new Date(filterFromDate.value)) : null;
    const toDate = filterToDate.value ? getUTCDate(new Date(filterToDate.value)) : null;
    
    return currentStats.filter((payment) => {
        if (hidePendingPayments && payment.pendiente) {
            return false;
        }

        // Filtrado por texto
        // if (searchValue) {
        //     const fieldValue = String(payment[searchKey] || '').toLowerCase();
        //     if (!fieldValue.includes(searchValue)) return false;
        // }

        // Filtrado por fechas
        if (fromDate || toDate) {
            const paymentDate = getUTCDate(new Date(payment.fecha));   

            if (isNaN(paymentDate.getTime())) return true;
            if (fromDate && paymentDate < fromDate) return false;
            if (toDate && paymentDate > toDate) return false;
        }
        
        return true;
    });
}


function applyFiltersAndRender() {
    renderStatsTable(getFilteredStats());
}


// Mensaje animado de carga para que no se aburran los clientes con déficit de atención
function loopLoadingMessage() {
    statsMsgDiv.textContent = 'Cargando información.';
    timeout2 = setTimeout(() => {
        statsMsgDiv.textContent = 'Cargando información..';
        timeout3 = setTimeout(() => {
            statsMsgDiv.textContent = 'Cargando información...';
        }, 750);
    }, 750);
}

async function loadStats() {
    // Llamo a la función directamente la 1ª vez para que se ejecute instantáneamente
    loopLoadingMessage();
    interval1 = setInterval(loopLoadingMessage, 2250);

    try {
        const response = await fetch('/api/pago/get-payments', { credentials: 'include' });
        clearInterval(interval1);
        clearTimeout(timeout2);
        clearTimeout(timeout3);

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
    renderBillingChart(currentStats);

    if (!payments.length) {
        if (statsReport) {
            statsReport.style.display = 'none';
        }
        return showMessage('No se encontraron pagos.', 'info', 'statsMessage');
    }

    statsMsgDiv.textContent = '';
    statsMsgDiv.className = 'message';

    if (statsReport) {
        const pagos = payments.length;
        const total = payments.reduce((a, p) => a + p.monto, 0);
        statsReport.style.display = '';
        statsReport.innerHTML = 
            `El sistema registra <span style="font-weight: bold; color: #d39e0c">${pagos}</span> pagos realizados,<br>` +
            `alcanzando un monto de <span style="font-weight: bold; color: #07b816">$${total}</span> facturados.`;
    }
}

function renderBillingChart(payments) {
    const now = new Date();
    const endMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startMonth = new Date(endMonth.getFullYear(), endMonth.getMonth() - 5, 1);

    const monthKeys = [];
    const monthLabels = [];
    const monthTotals = {};

    for (let i = 0; i < 6; i += 1) {
        const month = new Date(startMonth.getFullYear(), startMonth.getMonth() + i, 1);
        const key = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
        monthKeys.push(key);
        monthLabels.push(`${month.toLocaleString('es-ES', { month: 'short' })} ${month.getFullYear()}`);
        monthTotals[key] = 0;
    }

    console.log("payments: ", payments);
    payments.forEach((payment) => {
        const paymentDate = new Date(payment.fecha);
        if (isNaN(paymentDate.getTime())) return;

        const paymentMonthKey = `${paymentDate.getFullYear()}-${String(paymentDate.getMonth() + 1).padStart(2, '0')}`;
        if (!monthTotals.hasOwnProperty(paymentMonthKey)) return;

        const amount = Number(payment.monto) || 0;
        monthTotals[paymentMonthKey] += amount;
    });

    const chartData = monthKeys.map((key, index) => ({
        date: key,
        label: monthLabels[index],
        total: monthTotals[key],
    }));

    const maxValue = Math.max(...chartData.map((item) => item.total), 1);
    const minValue = Math.min(...chartData.map((item) => item.total), 0);
    const range = Math.max(maxValue - minValue, 1);

    const pointCount = chartData.length;
    const points = chartData
        .map((item, index) => {
            const x = pointCount === 1 ? 50 : (index / (pointCount - 1)) * 100;
            const y = 100 - ((item.total - minValue) / range) * 90;
            return `${x},${y}`;
        })
        .join(' ');

    const pointMarkers = chartData
        .map((item, index) => {
            const x = pointCount === 1 ? 50 : (index / (pointCount - 1)) * 100;
            const y = 100 - ((item.total - minValue) / range) * 90;
            // keep the point inside the SVG bounds and aligned to the line
            return `<span class="line-point-overlay" style="left: calc(${x}%); top: calc(${y}%);" title="${escapeHtml(item.label)} - $${escapeHtml(item.total.toFixed(2))}"></span>`;
        })
        .join('');

    const labelsHtml = chartData
        .map((item) => `
            <div class="line-chart-label" title="${escapeHtml(item.label)}">
                <div class="line-chart-value">$${escapeHtml(item.total.toFixed(2))}</div>
                <div>${escapeHtml(item.label)}</div>
            </div>
        `)
        .join('');

    chartContainer.innerHTML = `
        <div class="line-chart-wrapper">
            <div class="chart-svg-wrapper">
                <svg class="line-chart-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Gráfico de facturación">
                    <polyline points="${points}" class="line-path" />
                    <polygon points="0,100 ${points} 100,100" class="line-area" />
                </svg>
                <div class="points-overlay">
                    ${pointMarkers}
                </div>
            </div>
            <div class="line-chart-labels">${labelsHtml}</div>
        </div>
    `;
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
