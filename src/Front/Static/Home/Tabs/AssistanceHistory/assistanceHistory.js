let currentAssistances = [];
let actividadesDisponibles = [];

// simulando lo que devolvería el backend
const asistenciasDePrueba = [
  {
    _id: "82fd25e7-2fcb-4855-888a-d43397bc52d6",
    idUsuario: "d2b68a09-3d95-4bca-b2bd-f12c819b0753",
    actividad: "Yoga",
    dia: "lunes",
    hora: "10:00",
    fecha: "2026-05-18T10:00:00.000Z"
  },
  {
    _id: "91ab25e7-2fcb-4855-888a-d43397bc52d6",
    idUsuario: "d2b68a09-3d95-4bca-b2bd-f12c819b0753",
    actividad: "Spinning",
    dia: "miércoles",
    hora: "18:00",
    fecha: "2026-05-20T18:00:00.000Z"
  },
  {
    _id: "73cd25e7-2fcb-4855-888a-d43397bc52d6",
    idUsuario: "d2b68a09-3d95-4bca-b2bd-f12c819b0753",
    actividad: "Funcional",
    dia: "viernes",
    hora: "19:00",
    fecha: "2026-05-22T19:00:00.000Z"
  }
];

/* simulando lo que devuelve la base
const actividadesDePrueba = [
  { _id: "50825c5a-2e25-4839-9b7d-fb1a952421ce", nombre: "Yoga", precioMensual: 1007 },
  { _id: "d1d4a7f9-29be-41ba-baca-6f23fab51fd0", nombre: "Spinning", precioMensual: 1200 },
  { _id: "19597609-9dbc-44e0-af05-32a8f68611a7", nombre: "Funcional", precioMensual: 1100 },
  { _id: "bc226f6-c915-4776-aee1-202da6c6bb65", nombre: "Crossfit", precioMensual: 1300 },
  { _id: "7d3a3bdd-de04-41f1-9f58-1b61e4e68abb", nombre: "Hola", precioMensual: 2 }
];
*/

async function cargarActividades() {
  const select = document.getElementById("showActivity");
  select.innerHTML = "";

  const optionTodas = document.createElement("option");
  optionTodas.value = "todas";
  optionTodas.textContent = "Todas";
  select.appendChild(optionTodas);

  try {
    const res = await fetch("/api/actividad/get-all", {
      method: "GET",
      credentials: "include"
    });
    if (!res.ok) throw new Error("Error al obtener actividades");
    actividadesDisponibles = await res.json();
    console.log("Actividades del backend", actividadesDisponibles);

    actividadesDisponibles.forEach(act => {
      const option = document.createElement("option");
      option.value = act.nombre.toLowerCase();
      option.textContent = act.nombre;
      select.appendChild(option);
    });

    select.value = "todas";
  } catch (err) {
    console.error("Error cargando actividades:", err);
    const optionError = document.createElement("option");
    optionError.value = "error";
    optionError.textContent = "Error al cargar";
    select.appendChild(optionError);
  }
}



function mostrarAsistencias(lista) {
  const container = document.querySelector(".assistance-history-container");
  container.innerHTML = "";

  if (lista.length === 0) {
    const mensaje = document.createElement("div");
    mensaje.classList.add("assistance-detail");
    mensaje.textContent = "No hay asistencias";
    container.appendChild(mensaje);
    return;
  }

  const ordenadas = [...lista].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

  ordenadas.forEach(asistencia => {
    const div = document.createElement("div");
    div.classList.add("assistance-container");

    // Para los colores
    div.classList.add(asistencia.actividad.toLowerCase());

    // Fecha
    const fecha = document.createElement("div");
    fecha.classList.add("assistance-date");
    fecha.textContent = new Date(asistencia.fecha).toLocaleDateString("es-AR");

    // Detalle
    const detalle = document.createElement("div");
    detalle.classList.add("assistance-detail");
    detalle.textContent = `Detalle: ${asistencia.actividad} (${asistencia.dia} ${asistencia.hora})`;

    div.appendChild(fecha);
    div.appendChild(detalle);

    container.appendChild(div);
  });
}


/* harcodeado
function cargarActividades() {
  const select = document.getElementById("showActivity");
  select.innerHTML = "";

  const optionTodas = document.createElement("option");
  optionTodas.value = "todas";
  optionTodas.textContent = "Todas";
  select.appendChild(optionTodas);

  
  actividadesDisponibles.forEach(act => {
    const option = document.createElement("option");
    option.value = act.nombre.toLowerCase();
    option.textContent = act.nombre;
    select.appendChild(option);
  });


  select.value = "todas";
}
*/


// Filtrar por actividad
function aplicarFiltroActividad() {
  const actividadSeleccionada = document.getElementById("showActivity").value.toLowerCase();
  let filtrados = [...currentAssistances];

  if (actividadSeleccionada !== "todas") {
    filtrados = filtrados.filter(a => a.actividad.toLowerCase() === actividadSeleccionada);
  }

  mostrarAsistencias(filtrados);
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  currentAssistances = asistenciasDePrueba; // usar datos de prueba
  //actividadesDisponibles = actividadesDePrueba; // usar actividades de prueba
  cargarActividades();
  mostrarAsistencias(currentAssistances);

  document.getElementById("filterButton").addEventListener("click", aplicarFiltroActividad);
});

