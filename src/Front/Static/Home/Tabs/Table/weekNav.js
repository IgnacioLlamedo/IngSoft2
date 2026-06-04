const weekDisplay = document.getElementById("weekDisplay");

// Obtenemos la fecha actual
let today = new Date();

// Si hoy es domingo (getDay() === 0), avanzamos a la siguiente semana
if (today.getDay() === 0) {
  today.setDate(today.getDate() + 1); // pasamos al lunes siguiente
}

// Calculamos el lunes de la semana actual
function getMonday(d) {
  const date = new Date(d);
  const day = date.getDay(); // 0=domingo, 1=lunes, ...
  const diff = (day === 0 ? -6 : 1) - day; 
  date.setDate(date.getDate() + diff);
  return date;
}

// Estado: lunes actual

let currentMonday = getMonday(today);


function actualizarSemana() {
  const inicio = new Date(currentMonday); // lunes actual
  const fin = new Date(inicio);
  fin.setDate(inicio.getDate() + 5);

  const opcionesHeader = {
      day: '2-digit',
      month: '2-digit'
  };

  const opcionesDataset = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  };
  const inicioStr = inicio.toLocaleDateString('es-AR', opcionesDataset);
  const finStr = fin.toLocaleDateString('es-AR', opcionesDataset);

  // Actualizamos el rango arriba
  weekDisplay.textContent = `${inicioStr} - ${finStr}`;

  // Actualizamos cada header con su fecha
  const headers = document.querySelectorAll(".slotHeader");
  /* console.log("Estos son los headers a actualizar: ");
  console.log(headers); */
  headers.forEach((th, i) => {

    const fecha = new Date(inicio);
    fecha.setDate(inicio.getDate() + i);

    const fechaHeader = fecha.toLocaleDateString(
        'es-AR',
        opcionesHeader
    );

    const fechaCompleta = fecha.toLocaleDateString(
        'es-AR',
        opcionesDataset
    );

    th.innerHTML = `${th.dataset.dia} ${fechaHeader}`;

    th.dataset.fecha = fechaCompleta;
    //console.log(th);
  });
}



// Botón atrás: solo si no retrocede antes de la semana actual
document.getElementById("prevWeek").addEventListener("click", () => {
  const posibleAnterior = new Date(currentMonday);
  posibleAnterior.setDate(posibleAnterior.getDate() - 7);

  // No permitir retroceder si el lunes anterior es menor al lunes de la semana actual calculada desde "today"
  const mondayActual = getMonday(new Date(today));
  if (posibleAnterior >= mondayActual) {
    currentMonday = posibleAnterior;
    refrescarSemana();
  }
});

// Botón adelante: siempre avanza
document.getElementById("nextWeek").addEventListener("click", () => {
  currentMonday.setDate(currentMonday.getDate() + 7);
  refrescarSemana();
});

// Manejo de clic en clases
document.querySelectorAll(".slotDeClase").forEach(div => {
  div.addEventListener("click", () => {
    const fila = div.closest("tr");
    const horario = fila.querySelector("td").innerText;

    const colIndex = div.closest("td").cellIndex;
    const header = document.querySelector(`#diasHeader th:nth-child(${colIndex+1})`);
    const fecha = header ? header.dataset.fecha : "Fecha desconocida";

    // Si tenés varias salas en la fila, podés ajustar la lógica
    const sala = fila.querySelector(".slotDeSala")?.innerText || "Sala desconocida";

//    alert(`Clase: ${div.innerText}\nHorario: ${horario}\nFecha: ${fecha}\n${sala}`);
  });
});

async function refrescarSemana() {

    actualizarSemana();

    //Función de classSlot para recargar las clases de la semana actualizada
    if(window.recargarClasesSemana){
        await window.recargarClasesSemana(currentMonday);
    }
}
