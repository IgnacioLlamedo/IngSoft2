let html5QrScanner = null;

function abrirAsistencia(elemento) {
  console.log("Elemento clickeado:", elemento);
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

  <button id="btnMostrarDNI">Tomar asistencia DNI</button>

  <div id="dniContainer" hidden style="margin-top:10px;">
    <input type="text" id="dniInput" placeholder="Ingrese DNI">
    <button id="btnDNI">Confirmar asistencia</button>
    <button id="btnVolverAtras">Volver</button>
  </div>`;

  // Mostrar modal
  document.getElementById("asistenciaModal").style.display = "flex";

  // Enganchar botones internos
  document.getElementById("btnQR").addEventListener("click", () => {
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

    const res = await fetch(`/api/asistencia/obtenerQR/${idClase}/${fecha}`);
    const data = await res.json();

    console.log("La data QR para asistencia recibida fue: ")
    console.log(data);

    //Acá hay que mostrar el QR en pantalla, despues averiguo como hacerlo.
  
  });

  document.getElementById("btnMostrarDNI").addEventListener("click", () => {
    document.getElementById("btnQR").hidden = true;
    document.getElementById("btnMostrarDNI").hidden = true;

    document.getElementById("dniContainer").hidden = false;
  });

  // Confirmar asistencia DNI
  document.getElementById("btnDNI").addEventListener("click", () => {
    const dni = document.getElementById("dniInput").value.trim();

    if (!dni) {
      alert("Ingrese un DNI");
      return;
    }

    console.log("Registrar asistencia por DNI:", dni);
    const res = await fetch(`/api/asistencia/asistenciaDNI/${idClase}/${fecha}`, {
      method: "POST",
      headers: {
          "Content-Type": "application/json"
      },
      body: JSON.stringify({
          dni: dni
      })
    })
    const data = await res.json();

    if (data.success){
      alert("Asistencia registrada correctamente");
    }
    else{
      console.log(data.message);
    }
  });

  //Botón volver
  const botonVolver = document.getElementById("btnVolverAtras");
  console.log(botonVolver)
  botonVolver.addEventListener("click", () => {
    console.log("Acá estoy")
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