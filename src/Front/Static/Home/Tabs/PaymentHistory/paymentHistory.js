let currentPayments = [];

function mostrarPagos(lista) {
  const container = document.querySelector(".payment-history-container");
  container.innerHTML = "";

  if (lista.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.classList.add("pay-detail");
    mensaje.textContent = "No hay pagos";
    mensaje.style.color = "white";
    container.appendChild(mensaje);
    return;
  }

  lista.forEach(pago => {
    const div = document.createElement("div");
    div.classList.add("pay-container");

    // Fecha de pago
    const fecha = document.createElement("div");
    fecha.classList.add("pay-date");
    fecha.textContent = new Date(pago.fechaPago).toLocaleDateString("es-AR");

    // Detalle: tipo + clase
    const detalle = document.createElement("div");
    detalle.classList.add("pay-detail");
    const claseInfo = pago.claseInfo || "N/A";
    detalle.textContent = `Detalle: Pago ${pago.pendiente ? "Pendiente" : pago.estado} de clase ${claseInfo}`;
    console.log(pago);

    // Monto
    const monto = document.createElement("div");
    monto.classList.add("pay-amount");
    monto.textContent = `$${pago.monto}`;

    div.appendChild(fecha);
    div.appendChild(detalle);
    div.appendChild(monto);

    container.appendChild(div);
  });
}

// Aplicar filtros
function aplicarFiltros() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const order = document.getElementById("showMethods").value;

  let filtrados = [...currentPayments];

  // rango incorrecto
  if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
    const container = document.querySelector(".payment-history-container");
    container.innerHTML = "<div class='pay-detail'>El rango de fechas no es correcto.</div>";
    return;
  }

  // Filtrar por fechas
  if (startDate) {
    filtrados = filtrados.filter(p => new Date(p.fechaPago) >= new Date(startDate));
  }
  if (endDate) {
    filtrados = filtrados.filter(p => new Date(p.fechaPago) <= new Date(endDate));
  }

  // Ordenar por fecha
  filtrados.sort((a, b) => {
    if (order === "asc") {
      return new Date(a.fechaPago) - new Date(b.fechaPago);
    } else {
      return new Date(b.fechaPago) - new Date(a.fechaPago);
    }
  });

  mostrarPagos(filtrados);
}


async function cargarPagos() {
  try {
    const res = await fetch(`/api/pago/get-user-payments`, { 
        method: 'GET',
        credentials: "include",
    });
    if (!res.ok) throw new Error("No se pudieron cargar los pagos.");
    const pagos = await res.json();
    currentPayments = Array.isArray(pagos) ? pagos : [];
    mostrarPagos(currentPayments);
  } catch (err) {
    console.error("Error cargando pagos:", err);
    const container = document.querySelector(".payment-history-container");
    container.innerHTML = "<div class='pay-detail'>Error al cargar pagos.</div>";
  }
}


document.addEventListener("DOMContentLoaded", () => {
  cargarPagos();
  document.getElementById("filterButton").addEventListener("click", aplicarFiltros);
});