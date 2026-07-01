let actividadesUsuario = [];
let userData;
getSessionData();
getMyReservations();

async function getMyReservations() {

    const res = await fetch('/api/reservas/my-reservations', {
        method: 'GET'
    });

    const resData = await res.json();

    /* console.log("Estas son todas las reservaciones DEL USUARIO: ")
    console.log(resData); */

    const fechaActual = new Date();

    actividadesUsuario = resData.reservas.map(r => {

        console.log("Esta es una reserva del usuario: ");
        console.log(r);
        console.log("/////////////////////////////////////////////////"); 

        // =========================================
        // RESERVA ÚNICA
        // =========================================
        if (r.tipo === "unica") {
             
            const claseGeneral = r.idClaseEspecifica.idClaseGeneral;

            /**
             * Acá agregué para mostrar bien el precio en caso de ser una seña de única,
             * habría que hascer parte del fetch traerse los pagos de la reserva y no solo los ids
             * de los pagos para así poner la información precisa. -- más adelante.
             */
            let precioUnica = claseGeneral.idActividad.precioMensual / 4;

            //Cuando agregue la lógica de cancelar resto de seña, hay que cambiar este campo en reserva!!!!!!!!!!!
            if (r.señada){
                precioUnica = precioUnica/2;
            }

            const horario =
                `${claseGeneral.hora}:00 - ${claseGeneral.hora + 1}:00`;

            const fechaClase = new Date(r.idClaseEspecifica.fechaEspecifica); //En clase única, no entre por idClase.

            return {

                idReserva: r._id,

                claseEspecifica: r.idClaseEspecifica,

                actividad:
                    claseGeneral.idActividad.nombre,

                tipo: "Unica",

                horario,

                fecha:
                    new Date(r.idClaseEspecifica.fechaEspecifica)
                        .toLocaleDateString("es-AR"),

                dia: claseGeneral.dia,

                sala:
                    claseGeneral.idSala.nombre,

                profesor:
                    claseGeneral.idProfesor.nombre,

                precio: precioUnica,

                vencida: 
                    fechaClase < fechaActual,

                señada:
                    r.señada,

                estado: r.estado,
                cancelada: r.estado === "cancelada",
            };
        }

        // =========================================
        // RESERVA MENSUAL
        // =========================================
        else {

            // Uso la primera clase para info común
            const primeraClase = r.clases[0].idClase;

            const claseGeneral = primeraClase.idClaseGeneral;

            const horario = `${claseGeneral.hora}:00 - ${claseGeneral.hora + 1}:00`;

            const fechas = r.clases.map(c => ({
                fecha: new Date(c.idClase.fechaEspecifica)
                        .toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit"
                        }),

                estado: c.estado,

                cancelada: c.estado === "cancelada"
            }));

            const fechaClase = new Date(r.clases[r.clases.length - 1].idClase.fechaEspecifica);

            
            let vencida = false;

            if (fechaClase < fechaActual) {
                vencida = true;
            }

            return {

                idReserva: r._id,

                actividad:
                    claseGeneral.idActividad.nombre,

                tipo: "Mensual",

                horario,
                
                clases: r.clases,

                fecha: fechas,

                //Se deben mostrar las fechas (15/5, etc) porque se pueden cancelar
                //las clases únicas dentro de una mensualidad.
                //Acá habria que recorrer r.clases y si:
                //  1. alguna clase tiene estado cancelada, no mostrarla
                //  2. alguna clase tiene estado en espera, mostrarla en color naranja
                dia:
                    claseGeneral.dia,

                sala:
                    claseGeneral.idSala.nombre,

                profesor:
                    claseGeneral.idProfesor.nombre,

                precio:
                    claseGeneral.idActividad.precioMensual,

                vencida
            };
        }
    });

    /* console.log("Estas son las actividades del usuario ya formateadas para mostrar: ");
    console.log(actividadesUsuario); */

    renderActividades();
}

function mostrarConfirmacionCancelacion(fecha, callbackConfirmar) {

    const modal = document.getElementById("confirmCancelModal");

    const btnCerrar =
    document.getElementById("btnCerrarConfirmacion");

    btnCerrar.onclick = () => {
        modal.style.display = "none";
    };

    const btnVolver =
        document.getElementById("btnVolverCancelar");

    const btnConfirmar =
        document.getElementById("btnConfirmarCancelar");

    btnConfirmar.textContent =
        `Cancelar clase del ${fecha}`;

    modal.style.display = "flex";

    btnVolver.onclick = () => {
        modal.style.display = "none";
    };

    btnConfirmar.onclick = async () => {
        modal.style.display = "none";
        await callbackConfirmar();
    };

    modal.onclick = (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
};
}

// Referencias a los filtros
const activityFilter = document.getElementById("activityFilter");
const tipeFilter = document.getElementById("tipeFilter");
const dayFilter = document.getElementById("dayOfTheWeekFilter");
const statusFilter = document.getElementById("statusFilter");

// Contenedor principal donde se insertan las cajas
const main = document.querySelector("main");
const reservasContainter = document.getElementById("reservasContainter");

// Función para renderizar las actividades según filtros
function renderActividades() {
  // Primero borramos las cajas anteriores
  document.querySelectorAll(".box").forEach(box => box.remove());

  //Elimino los mensajes de sin actividades por filtro.
  document.querySelectorAll(".no-activities-message").forEach(msg => msg.remove());

  // Aplicamos filtros
  const filtradas = actividadesUsuario.filter(act => {

    const esCancelada =
        act.tipo === "Unica"
            ? act.estado === "cancelada"
            : act.fechas?.some(f => f.estado === "cancelada");

    const estaEnEspera =
        act.tipo === "Unica"
            ? act.estado === "en espera"
            : act.fechas?.some(f => f.estado === "en espera");
            
    const filtroActividad = activityFilter.value === "Todas" || act.actividad.toLowerCase() === activityFilter.value.toLowerCase();
    const filtroTipo = tipeFilter.value === "Todas" || act.tipo.toLowerCase() === tipeFilter.value.toLowerCase();
    const filtroDia = dayFilter.value === "Todas" ||
      (act.fecha && act.fecha.includes(dayFilter.value)) ||
      (act.dia && act.dia === dayFilter.value.toLowerCase());

    const filtroEstado = statusFilter.value === "Todas" ||
    (statusFilter.value === "NoVencidas" && !act.vencida && act.estado !== "en espera") ||
    (statusFilter.value === "Vencidas" && act.vencida) ||
    (statusFilter.value === "EnEspera" && estaEnEspera) ||
    (statusFilter.value === "Canceladas" && esCancelada);


    return filtroActividad && filtroTipo && filtroDia && filtroEstado;
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

  const boxesVencidas = [];

  // Creamos una caja por cada actividad filtrada
  filtradas.forEach(act => {
    console.log("Esto es actual dentro del filtradas.forEach: ")
    console.log(act);

    const esCancelada =
        act.tipo === "Unica"
            ? act.estado === "cancelada"
            : act.fecha?.some(f => f.estado === "cancelada");

    const esTotalmenteCancelada = 
        esCancelada
            ? act.tipo === "Unica"
                ? act.estado === "cancelada"
                : act.fecha?.every(f => f.estado === "cancelada")
            : false;

    const estaEnEspera =
        act.tipo === "Unica"
            ? act.estado === "en espera"
            : act.fecha?.some(f => f.estado === "en espera");

    const box = document.createElement("div");
    if (esCancelada) {
        box.classList.add(esTotalmenteCancelada ? "cancelada-total" : "cancelada");
    }

    if (estaEnEspera) {
        box.classList.add("en-espera");
    }
    box.classList.add("box", act.tipo.toLowerCase());

    // Título dinámico: Actividad - tipo
    const h3 = document.createElement("h3");
    if (act.señada)
        h3.textContent = `${act.actividad} - ${act.tipo} - Seña de Clase`;
    else
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

    if (act.tipo === "Unica") {  //Revisar si tipo puede ser seña
      const pFecha = document.createElement("p");
      pFecha.textContent = `Fecha: ${act.fecha}`;
      boxData.appendChild(pFecha);

      const pPrecio = document.createElement("p");
      pPrecio.textContent = `Precio por clase: $${act.precio}`;
      boxData.appendChild(pPrecio);
    } 
    else {

      const pDia = document.createElement("p");
      pDia.textContent = `Días: ${act.fecha.map(f => f.fecha).join(" - ")}`;
      boxData.appendChild(pDia);

      const pPrecio = document.createElement("p");
      pPrecio.textContent = `Precio mensual: $${act.precio}`;
      boxData.appendChild(pPrecio);
    }

    boxContent.appendChild(boxData);

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("box-buttons-container");

    if (estaEnEspera) {
        const btnSalirEspera = document.createElement("button");

        btnSalirEspera.textContent = "Salir de Lista de Espera";
        btnSalirEspera.classList.add("btn-salir-espera");

        btnSalirEspera.addEventListener("click", async () => {
            let descripcion;
            if (act.tipo === "Unica") 
                descripcion = act.fecha;
            else 
                descripcion =act.fecha.map(f => f.fecha).join(" - ");

            mostrarConfirmacionCancelacion(descripcion, async () => {
                const resultado = await fetch("/api/reservas/salir-lista-espera", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({idReserva: act.idReserva})
                });

                const res = await resultado.json();

                if (res.success) {
                    console.log("Ha salido de lista de espera exitosamente.");
                    await getMyReservations(); //actualizo el listado de actividades.
                }
                else {
                    console.log(res.message);
                }
            });;  
        });

        buttonsContainer.appendChild(btnSalirEspera);
    }

    // Si la actividad no está vencida, muestro botones de acción
    if (!act.vencida) {
    // Botones con listeners
        /* console.log("La clase actual es de tipo ", act.tipo, " y estas son sus clases: ")    */ 

        let clasesACancelar;
        if (act.tipo === 'Mensual'){
            console.log(act.clases);
            clasesACancelar = act.clases;
        }
        else{
            console.log(act.idClaseEspecifica);
            clasesACancelar = act.claseEspecifica;
        }

        const btnCancelar = document.createElement("button");
        btnCancelar.classList.add("box-button", "cancel-reservation");
        btnCancelar.textContent = "Cancelar Reserva";


        if (act.tipo === 'Mensual'){

            btnCancelar.addEventListener("click", () => {
            const modal = document.getElementById("cancelarMensualModal");
            modal.onclick = (e) =>
            {
                if (e.target === modal) {
                    modal.style.display = "none";
                }
            }
            const lista = document.getElementById("listaClasesMensual");
            lista.innerHTML = ""; // limpio antes de renderizar
            
            act.clases.forEach((claseActual,index) => {
                const fecha = new Date(claseActual.idClase.fechaEspecifica)
                                .toLocaleDateString("es-AR");
                const btnClase = document.createElement("button");
                btnClase.textContent = `Cancelar clase del ${fecha}`;
                btnClase.classList.add("box-button");

                const esCancelado = claseActual.idClase.anotados.some(
                    u => u.estado === "cancelado" && u.idUsuario === userData.session.id
                );
                
                const noExiste = claseActual.idClase.anotados.some(
                    u => u.idUsuario === userData.session.id
                );

                //no creo que esto esté bien..              Facu: ¿Por? Lo que se podría hacer es que la clase btnClase tenga un addEventListener, y la clase y el tipo guardarlo en el dataset(?)
                
                if ((!esCancelado) && (noExiste)){
                    btnClase.addEventListener("click", async () => {
                        mostrarConfirmacionCancelacion(fecha, async () => {
                            console.log(btnClase.dataset)
                            const res = await fetch('/api/reservas/cancelar-reserva', {
                                method: 'POST',
                                headers: {
                                    "Content-Type": "application/json"
                                },
                                body: JSON.stringify({
                                    clase: act.clases[index],
                                    tipo: act.tipo
                                })
                            });
                            const resData = await res.json();
                            if (resData.success) {
                                console.log(`Cancelaste la clase del ${fecha}`);
                                await getMyReservations();
                                document.getElementById(
                                    "cancelarMensualModal"
                                ).style.display = "none";
                                await getMyReservations();
                            }
                            else {
                                console.log(resData.message);
                            }
                        });
                    });
                }
                else{
                    btnClase.classList.add("boton-ya-cancelada");
                    btnClase.disabled = true;
                    btnClase.style.backgroundColor = "#858585";
                    btnClase.textContent = `Clase del ${fecha} (Cancelada)`;
                }

                lista.appendChild(btnClase);
            });

            modal.style.display = "flex";
            });

            // Cerrar modal
            document.querySelector("#cancelarMensualModal .close-cancellations")
                    .addEventListener("click", () => {
            document.getElementById("cancelarMensualModal").style.display = "none";
            });
        }
        else{
            btnCancelar.addEventListener("click", async () => {
                mostrarConfirmacionCancelacion(act.fecha, async () => {
                    const res = await fetch('/api/reservas/cancelar-reserva', {
                        method: 'POST',
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            clase: clasesACancelar,
                            tipo: act.tipo
                        })
                    });
                    const resData = await res.json();

                    if (resData.success) {
                        console.log(`Cancelaste la reserva de ${act.actividad} - ${act.tipo}`);
                        await getMyReservations();
                    }
                    else {
                        console.log(resData.message);
                    }
                });
            });
        }
        buttonsContainer.appendChild(btnCancelar);

        if (act.señada) {            
            const btnPagar = document.createElement("button");
            btnPagar.classList.add("box-button", "pay-rest");
            btnPagar.textContent = "Pagar resto";
            btnPagar.addEventListener("click", () => {
                //ACÁ HAY QUE AGREGAR EL FETCH QUE PERMITE PAGAR EL RESTO!!!!!



                console.log(`Pagaste el resto de la clase única de ${act.actividad}`);
            });
            buttonsContainer.appendChild(btnPagar);
        } 
        else if (act.tipo === "Mensual") {
            //?
            /* const btnCancelarClase = document.createElement("button");
            btnCancelarClase.classList.add("box-button", "cancel-next-class");
            btnCancelarClase.textContent = "Cancelar Siguiente Clase";
            btnCancelarClase.addEventListener("click", () => {
                console.log(`Cancelaste la próxima clase de ${act.actividad}`);
            });
            buttonsContainer.appendChild(btnCancelarClase); */

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
        
    }
    else {
        box.classList.add("vencida");
        boxContent.appendChild(buttonsContainer);
        box.appendChild(boxContent);
        boxesVencidas.push(box);
        return;
    }

    reservasContainter.appendChild(box);
  });

  boxesVencidas.forEach(box => {
    reservasContainter.appendChild(box);
  });
}

// Eventos de cambio en los filtros
activityFilter.addEventListener("change", renderActividades);
tipeFilter.addEventListener("change", renderActividades);
dayFilter.addEventListener("change", renderActividades);
statusFilter.addEventListener("change", renderActividades);

// Render inicial
//renderActividades();


//Esta función hay que exportarla, la estamos usando en 5 scripts distintos jaja
async function getSessionData() {
    const response = await fetch("/session-data");
    if (!response.ok) {
            throw new Error('Error al cargar información del usuario.');
        }
    const sessionData = await response.json();
    userData = sessionData;
}