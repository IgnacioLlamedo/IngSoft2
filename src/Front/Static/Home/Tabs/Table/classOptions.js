let html5QrScanner = null;
const body = document.getElementById("asistenciaBody");

async function abrirAsistencia(elemento) {
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
  body.innerHTML = `
  <div id="infoAsistencia">
    <h3>${clase} (${horario})</h3>
    <p>Fecha: ${fecha}</p>
    <p>Sala: ${sala}</p>

    <div id="mensajeAsistencia"></div>

    <button id="btnQR">Tomar asistencia QR</button>

    <button id="btnMostrarDNI">Tomar asistencia DNI</button>
  </div>
  <div id="dniContainer" hidden style="margin-top:10px;">
    <input type="text" id="dniInput" placeholder="Ingrese DNI">
    <button id="btnDNI">Confirmar asistencia</button>
    <button id="btnVolverAtras">Volver</button>
  </div>
  
  <div id="qrContainer" hidden style="margin-top:20px;">
  </div>
  <button id="btnCerrarQR" hidden>
    Cerrar QR
  </button>
  `;

  // Mostrar modal
  document.getElementById("asistenciaModal").style.display = "flex";
  const mensajeAsistencia = document.getElementById("mensajeAsistencia");

  const idClase = elemento.dataset.id;

    
    const [dia, mes, año] = fecha.split('/').map(Number);

    const horaInicio = horario.split('-')[0].trim();

    const [hora, minutos] = horaInicio.split(':').map(Number);

    const fechaBase = new Date(
        año,
        mes - 1,
        dia,
        hora,
        minutos
    );

    fechaBase.setSeconds(0, 0);

  // Enganchar botones internos
  document.getElementById("btnQR").addEventListener("click", async () => {
    mensajeAsistencia.innerHTML = "";
    //usando la idClase y fechaEspecifica consiguo el token para generar el qr
    const res = await fetch('/api/asistencia/obtenerQR', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        idClase: idClase,
        fecha: fechaBase
      })
    });
    const data = await res.json();

    /* console.log("La data QR para asistencia recibida fue: ")
    console.log(data);
    console.log(data.token);*/

    //Creo el QR y lo muestro.
    const infoAsistencia = document.getElementById("infoAsistencia");
    const qrContainer = document.getElementById("qrContainer");
    const btnCerrarQR = document.getElementById("btnCerrarQR");

    btnCerrarQR.addEventListener("click", () => {
      qrContainer.innerHTML = "";
      infoAsistencia.hidden = false;
      qrContainer.hidden = true;
      btnCerrarQR.hidden = true;
    });

    if (data.success) {
      infoAsistencia.hidden = true;
      btnCerrarQR.hidden = false;
      qrContainer.hidden = false;
      new QRCode(
        qrContainer,
        data.token
      );
    }
    else
      mensajeAsistencia.innerHTML = data.message;
  });

  

  document.getElementById("btnMostrarDNI").addEventListener("click", () => {
    mensajeAsistencia.innerHTML = "";
    document.getElementById("btnQR").hidden = true;
    document.getElementById("btnMostrarDNI").hidden = true;

    document.getElementById("dniContainer").hidden = false;
  });

  // Confirmar asistencia DNI
  document.getElementById("btnDNI").addEventListener("click", async () => {
    mensajeAsistencia.innerHTML = "";
    const dni = document.getElementById("dniInput").value.trim();

    if (!dni) {
      alert("Ingrese un DNI");
      return;
    }

    const res = await fetch('/api/asistencia/asistenciaDNI', {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          dni: dni,
          idClase: idClase,
          fecha: fechaBase
      })
    })
    const data = await res.json();
    console.log("Esto es lo recibido al volver de asistenciaDNI")
    console.log(data);

    if (data.success){
      alert("Asistencia registrada correctamente");
    }
    else{
      mensajeAsistencia.innerHTML = data.message;
    }
  });

  //Botón volver
  const botonVolver = document.getElementById("btnVolverAtras");
  botonVolver.addEventListener("click", () => {
    mensajeAsistencia.innerHTML = "";
    document.getElementById("btnQR").hidden = true;
    document.getElementById("btnMostrarDNI").hidden = true;
    document.getElementById("dniContainer").hidden = true;

    document.getElementById("btnQR").hidden = false;
    document.getElementById("btnMostrarDNI").hidden = false;

    document.getElementById("dniInput").value = "";
  });

  // Botón de cerrar modal
  document.getElementById("closeAsistencia").addEventListener("click", () => {
    document.getElementById("asistenciaModal").style.display = "none";
  });

  
}