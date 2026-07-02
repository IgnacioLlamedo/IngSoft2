let salas;

init();
//debugger;
async function init() {
    await crearTabla();
    // Usar el lunes actual de weekNav
    if (window.currentMonday) {
        await getAllClasses(window.currentMonday);
    }
    // Actualizar la semana para que se pinten fechas en headers
    if (window.actualizarSemana) {
        window.actualizarSemana();
    }
}
refrescarSemana();



async function crearTabla() {

    salas = await getAllSalas();

    const tabla = document.getElementById("tablaHorarios");

    const header = document.createElement("tr");

    //No tiene que tener formato cammel porque los días se guardan así en db
    const dias = [
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"
    ]; /* -> esto podría hacerse en una función que permita al admin
    decididr que días mostrar (Pensando en lo que dijo la profe de "destacarse")*/

    //x2
    const horas = [];
    for(let h = 7; h <= 21; h++) {
        horas.push(h);
    }

    //Se crea el header (horarios + días de la semana)
    header.innerHTML = `<th>Horarios</th> <th>Sala</th>
        ${dias.map(dia => `<th class="slotHeader" data-dia="${dia}">${dia}</th>`
        ).join("")}
    `;

    tabla.appendChild(header);

    //Por cada horario se crea una fila.
    horas.forEach(hora => {

        const tr = document.createElement("tr");

        //creo la hora y las salas que existen
        let filaAct = `
            <td>${hora}:00 - ${hora + 1}:00</td>
            <td>
                ${salas.map(s =>
                    `<div class="slotDeSala">${s.nombre}</div>`
                ).join("")}
            </td>
        `;
        //Por cada día se crea la celda correspondiente con el horario
        dias.forEach(dia => {

            filaAct += `
                <td id="${dia}-${hora}">
                    ${salas.map(s =>
                        `<div class="slotDeClase"
                              data-sala="${s.nombre}">
                            Sin Clase
                        </div>`
                    ).join("")}
                </td>
            `;
        });

        tr.innerHTML = filaAct;

        tabla.appendChild(tr);
    });
}

//Función para recuperar las salas de la db
//Hay que modificarla para que recupere las clases de la semana actual.
async function getAllSalas() {
    const res = await fetch("/api/clases/getSalas");
    const resData = await res.json();

    return resData.salas;
}

let clasesData;


async function getAllClasses(fechaSemana) {
    console.log("Recuperando clases para la semana del: " + fechaSemana);
    const res = await fetch("/api/clases/get-all", {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            fechaSemana
        })
    });

    const resData = await res.json();
    clasesData = resData.clases;
    console.log("Desde classSlot.js -> estas son las clases conseguidas de db: ")
    console.log(clasesData);
    
    const ahora = new Date();
    const result = await fetch("/session-data");
    const sessionData = await result.json();

    clasesData.forEach(claseObj => {
        /* console.log("Esta es una clase encontrada en DB: ");
        console.log(claseObj); */
        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        if (typeof claseObj.clase.dia !== "string" || !isNaN(claseObj.clase.dia)) {
        console.log("Clase con día incorrecto:");
        console.log(claseObj);
    }
        console.log(tdId);

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);
        

        if (celda) {
            /* console.log("Desde classSlot, esto es una celda: ")
            console.log(celda) */

            celda.innerText = claseObj.actividad.nombre;
            celda.dataset.id = claseObj.clase._id; //Para mandar por crearPreferencia
            celda.dataset.clase = claseObj.actividad.nombre;


            celda.dataset.precio = claseObj.actividad.precioMensual;

            let cantidadAnotados = 0;

            if (claseObj.claseEsp) {
                cantidadAnotados = claseObj.claseEsp.anotados.length;
            }

            capacidadActual = `${cantidadAnotados}/${claseObj.clase.limiteClase}`;

            /* console.log("la capacidad de la clase de la fecha " + claseObj.clase.dia + " a la hora "+ claseObj.clase.hora)
            console.log(capacidadActual) */
            celda.dataset.capacidad = capacidadActual;

            //Para informar pedir confirmación si quiere entrar en lista de espera.
            celda.dataset.llena = cantidadAnotados >= claseObj.clase.limiteClase;

            /*
            if (sessionData.logged) {
                if (sessionData.session.rol === "cliente") {
                    celda.onclick = () => abrirPago(celda);
                } else {
                    celda.onclick = () => abrirAsistencia(celda);
                }
            }
            else {
                celda.onclick = () => abrirPago(celda);
            }
            */

            // Función auxiliar para parsear fechas en formato DD/MM/YYYY
            function parseFecha(fechaStr) {
                const [dia, mes, año] = fechaStr.split('/').map(Number);
                return new Date(año, mes - 1, dia); // mes - 1 porque Date usa 0-based
            }

            if (sessionData.logged) {
                if (sessionData.session.rol === "cliente") {
                    celda.onclick = () => {
                        const colIndex = celda.closest("td").cellIndex;
                        const header = document.querySelectorAll(".slotHeader")[colIndex - 2];
                        const fechaCelda = header ? parseFecha(header.dataset.fecha) : null;

                        const mesActual = ahora.getMonth();
                        const añoActual = ahora.getFullYear();

                        console.log(mesActual);

                        if (fechaCelda && 
                            (fechaCelda.getMonth() !== mesActual || fechaCelda.getFullYear() !== añoActual)) {
                            alert("No puedes seleccionar clases del mes siguiente.");
                            return;
                        }

                        abrirPago(celda);
                    };
                } else {
                    celda.onclick = () => {
                        const colIndex = celda.closest("td").cellIndex;
                        const header = document.querySelectorAll(".slotHeader")[colIndex - 2];
                        const fechaCelda = header ? parseFecha(header.dataset.fecha) : null;

                        const mesActual = ahora.getMonth();
                        const añoActual = ahora.getFullYear();

                        if (fechaCelda && 
                            (fechaCelda.getMonth() !== mesActual || fechaCelda.getFullYear() !== añoActual)) {
                            alert("No puedes tomar asistencia de clases del mes siguiente.");
                            return;
                        }

                        abrirAsistencia(celda);
                    };
                }
            } else {
                celda.onclick = () => {
                    const colIndex = celda.closest("td").cellIndex;
                    const header = document.querySelectorAll(".slotHeader")[colIndex - 2];
                    const fechaCelda = header ? parseFecha(header.dataset.fecha) : null;

                    const mesActual = ahora.getMonth();
                    const añoActual = ahora.getFullYear();

                    if (fechaCelda && 
                        (fechaCelda.getMonth() !== mesActual || fechaCelda.getFullYear() !== añoActual)) {
                        alert("No puedes seleccionar clases del mes siguiente.");
                        return;
                    }

                    abrirPago(celda);
                };
            }



            celda.classList.add("classColor");
            celda.style.setProperty('--value', claseObj.actividad.color);
        }
    });

    document.querySelectorAll('.slotDeClase').forEach(div => {
        if (div.innerText.trim() === "Sin Clase") {
            div.classList.add("sinclase");
            // ocultar los slots vacíos (aunque no queda mucho mejor)
            // div.style.display = "none";
        }
    });
}
async function recargarClasesSemana(fechaSemana) {

    document.querySelectorAll(".slotDeClase").forEach(div => {

        div.innerText = "Sin Clase";

        div.removeAttribute("data-id");
        div.removeAttribute("data-clase");
        div.removeAttribute("data-precio");
        div.removeAttribute("data-fecha");
        div.removeAttribute("data-capacidad");
        div.removeAttribute("data-llena");

        div.className = "slotDeClase";
    });

    /* Como esto recupera literalmente todas las clases,
        Borra el contenido y lo vuelve a cargar
        Hay que modificarlo para que recupere por semana. */
    await getAllClasses(fechaSemana);
};