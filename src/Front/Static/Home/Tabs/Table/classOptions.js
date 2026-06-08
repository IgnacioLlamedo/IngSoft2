function abrirAsistencia(elemento) {
  const clase = elemento.dataset.clase;
  const sala = elemento.dataset.sala;

  // Buscar horario desde la fila
  const fila = elemento.closest("tr");
  const horario = fila.querySelector("td").innerText;

  // Buscar fecha desde el header correspondiente
  const td = elemento.closest("td");
  const colIndex = td.cellIndex;
  const header = document.querySelectorAll(".slotHeader")[colIndex - 2];
  const fecha = header ? header.dataset.fecha : "";

  // Inyectar contenido en el body del modal
  const body = document.getElementById("asistenciaBody");
  body.innerHTML = `
    <h3>${clase} (${horario})</h3>
    <p>Fecha: ${fecha}</p>
    <p>Sala: ${sala}</p>
    <button id="btnQR">Tomar asistencia QR</button>
    <div style="margin-top:10px;">
      <input type="text" id="dniInput" placeholder="Ingrese DNI">
      <button id="btnDNI">Tomar asistencia DNI</button>
    </div>
  `;

  // Mostrar modal
  document.getElementById("asistenciaModal").style.display = "flex";

  // Enganchar botones internos
  document.getElementById("btnQR").addEventListener("click", () => {
    console.log("Abrir pop-up QR");
    // acá va la lógica de QR
  });

  document.getElementById("btnDNI").addEventListener("click", () => {
    const dni = document.getElementById("dniInput").value;
    console.log("Registrar asistencia por DNI:", dni);
    // acá hacés el fetch al backend
  });
}

// Botón de cerrar modal
document.getElementById("closeAsistencia").addEventListener("click", () => {
  document.getElementById("asistenciaModal").style.display = "none";
});

