let actividadesUsuario = [];

getMyReservations();

async function getMyReservations() {

    const res = await fetch('/api/reservas/my-reservations', {
        method: 'GET'
    });

    const resData = await res.json();

    console.log(resData);

    actividadesUsuario = resData.reservas.map(r => {

        // =========================================
        // RESERVA ÚNICA
        // =========================================
        if ((r.tipo === "unica") || (r.tipo === "seña")) {

            const claseGeneral =
                r.idClaseEspecifica.idClaseGeneral;

            const horario =
                `${claseGeneral.hora}:00 - ${claseGeneral.hora + 1}:00`;

            return {

                actividad:
                    claseGeneral.idActividad.nombre,

                tipo: "Unica",

                horario,

                fecha:
                    new Date(r.idClaseEspecifica.fechaEspecifica)
                        .toLocaleDateString("es-AR"),

                dia: null,

                sala:
                    claseGeneral.idSala.nombre,

                profesor:
                    claseGeneral.idProfesor.nombre,

                precio:
                    claseGeneral.precioMensual / 4
            };
        }

        // =========================================
        // RESERVA MENSUAL
        // =========================================
        else {

            // Uso la primera clase para info común
            const primeraClase =
                r.clases[0].idClase;

            const claseGeneral =
                primeraClase.idClaseGeneral;

            const horario =
                `${claseGeneral.hora}:00 - ${claseGeneral.hora + 1}:00`;

            const fechas = r.clases
                .map(c => {

                    const fecha =
                        new Date(c.idClase.fechaEspecifica);

                    return fecha.toLocaleDateString("es-AR", {
                        day: "2-digit",
                        month: "2-digit"
                    });

                })
                .join(" - ");

            return {

                actividad:
                    claseGeneral.idActividad.nombre,

                tipo: "Mensual",

                horario,

                fecha: fechas,

                dia:
                    claseGeneral.dia,

                sala:
                    claseGeneral.idSala.nombre,

                profesor:
                    claseGeneral.idProfesor.nombre,

                precio:
                    claseGeneral.precioMensual
            };
        }
    });

    console.log(actividadesUsuario);

    renderActividades();
}

// Referencias a los filtros
const activityFilter = document.getElementById("activityFilter");
const tipeFilter = document.getElementById("tipeFilter");
const dayFilter = document.getElementById("dayOfTheWeekFilter");

// Contenedor principal donde se insertan las cajas
const main = document.querySelector("main");

// Función para renderizar las actividades según filtros
function renderActividades() {
  // Primero borramos las cajas anteriores
  document.querySelectorAll(".box").forEach(box => box.remove());

  //Elimino los mensajes de sin actividades por filtro.
  document.querySelectorAll(".no-activities-message").forEach(msg => msg.remove());

  // Aplicamos filtros
  const filtradas = actividadesUsuario.filter(act => {
    const filtroActividad = activityFilter.value === "Todas" || act.actividad.toLowerCase() === activityFilter.value.toLowerCase();
    const filtroTipo = tipeFilter.value === "Todas" || act.tipo.toLowerCase() === tipeFilter.value.toLowerCase();
    const filtroDia = dayFilter.value === "Todas" ||
      (act.fecha && act.fecha.includes(dayFilter.value)) ||
      (act.dia && act.dia === dayFilter.value);

    return filtroActividad && filtroTipo && filtroDia;
  });

  // Si no hay actividades, mostramos un mensaje
  if (filtradas.length === 0) {
    const msg = document.createElement("p");
    msg.classList.add("no-activities-message"); //Le añado a la clase para poder eliminarlo
    msg.textContent = "No tienes actividades en este filtro.";
    msg.style.color = "white";
    main.appendChild(msg);
    return;
  }

  // Creamos una caja por cada actividad filtrada
  filtradas.forEach(act => {
    const box = document.createElement("div");
    box.classList.add("box", act.tipo.toLowerCase());

    // Título dinámico: Actividad - tipo
    const h3 = document.createElement("h3");
    h3.textContent = `${act.actividad} - ${act.tipo}`;
    box.appendChild(h3);

    const hr = document.createElement("hr");
    box.appendChild(hr);

    const boxContent = document.createElement("div");
    boxContent.classList.add("box-content");

    // Datos de la actividad
    const boxData = document.createElement("div");
    boxData.classList.add("box-data", act.tipo.toLowerCase());

    const pHorario = document.createElement("p");
    pHorario.textContent = `Horario: ${act.horario}`;
    boxData.appendChild(pHorario);

    const pSala = document.createElement("p");
    pSala.textContent = `Sala: ${act.sala}`;
    boxData.appendChild(pSala);

    if (act.tipo === "Unica") {
      const pFecha = document.createElement("p");
      pFecha.textContent = `Fecha: ${act.fecha}`;
      boxData.appendChild(pFecha);

      const pPrecio = document.createElement("p");
      pPrecio.textContent = `Precio por clase: $${act.precio}`;
      boxData.appendChild(pPrecio);
    } 
    else {
      const pDia = document.createElement("p");
      pDia.textContent = `Día: ${act.dia}`;
      boxData.appendChild(pDia);

      const pPrecio = document.createElement("p");
      pPrecio.textContent = `Precio mensual: $${act.precio}`;
      boxData.appendChild(pPrecio);
    }

    boxContent.appendChild(boxData);

    // Botones con listeners
    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("box-buttons-container");

    const btnCancelar = document.createElement("button");
    btnCancelar.classList.add("box-button", "cancel-reservation");
    btnCancelar.textContent = "Cancelar Reserva";
    btnCancelar.addEventListener("click", () => {
      console.log(`Cancelaste la reserva de ${act.actividad} - ${act.tipo}`);
    });
    buttonsContainer.appendChild(btnCancelar);

    if (act.tipo === "Unica") {
      const btnPagar = document.createElement("button");
      btnPagar.classList.add("box-button", "pay-rest");
      btnPagar.textContent = "Pagar resto";
      btnPagar.addEventListener("click", () => {
        console.log(`Pagaste el resto de la clase única de ${act.actividad}`);
      });
      buttonsContainer.appendChild(btnPagar);
    } 
    else {
      const btnCancelarClase = document.createElement("button");
      btnCancelarClase.classList.add("box-button", "cancel-next-class");
      btnCancelarClase.textContent = "Cancelar Siguiente Clase";
      btnCancelarClase.addEventListener("click", () => {
        console.log(`Cancelaste la próxima clase de ${act.actividad}`);
      });
      buttonsContainer.appendChild(btnCancelarClase);

      const btnPagarMensual = document.createElement("button");
      btnPagarMensual.classList.add("box-button", "pay-reservation");
      btnPagarMensual.textContent = "Pagar Mensualidad";
      btnPagarMensual.addEventListener("click", () => {
        console.log(`Pagaste la mensualidad de ${act.actividad}`);
      });
      buttonsContainer.appendChild(btnPagarMensual);
    }

    boxContent.appendChild(buttonsContainer);
    box.appendChild(boxContent);

    main.appendChild(box);
  });
}

// Eventos de cambio en los filtros
activityFilter.addEventListener("change", renderActividades);
tipeFilter.addEventListener("change", renderActividades);
dayFilter.addEventListener("change", renderActividades);

// Render inicial
//renderActividades();
