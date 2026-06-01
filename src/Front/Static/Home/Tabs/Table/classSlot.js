init();

async function init() {
    await crearTabla(); /* Crea la tabla dinámicamente dependiendo de la cantidad de salas en DB
    De esta forma evitamos el problema que tuvimos en la Demo 1 xd*/
    await getAllClasses(); //Toma todas las clases existentes y las asigna en la tabla.
}

let salas;

async function crearTabla() {

    salas = await getAllSalas();

    /**
     * El problema es que si las salas se guardan en orden erroneo
     * en la DB, se muestran en ese orden, ahora están guardadas ->
     * Sala 1 -> Sala 3 -> Sala 2. 
     * Habría que reasignarlas o eliminar la 3 y volver a crearla.
     */

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
async function getAllSalas() {
    const res = await fetch("/api/clases/getSalas");
    const resData = await res.json();

    return resData.salas;
}

let clasesData;


async function getAllClasses() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET'
    });

    const resData = await res.json();
    clasesData = resData.clases;
    console.log("Desde classSlot.js -> estas son las clases conseguidas de db: ")
    console.log(clasesData);

    clasesData.forEach(claseObj => {

        console.log(claseObj); /*Si empieza a haber errores a la hora de mostrar las clases, usar esto
        para debuggear, Por cada claseGeneral que haya te genera 3 objetos y podes ver cual es
        el que le falta info.*/
        /* console.log(claseObj.sala);
        console.log(claseObj.actividad);
        console.log(claseObj.profesor);
        console.log(claseObj.claseEsp); */

        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);
        

        if (celda) {
            console.log(celda)
            celda.innerText = claseObj.actividad.nombre;
            celda.dataset.id = claseObj.clase._id; //Para mandar por crearPreferencia
            celda.dataset.clase = claseObj.actividad.nombre;
            celda.dataset.precio = claseObj.clase.precioMensual; //Esto está hardcodeado -> cambiar en prod. 
            
            /* //Si no tengo clase especifica, significa que no la creé y por lo tanto no tiene alumnos anotados.
            console.log(claseObj.claseEsp);
            console.log(claseObj.claseEsp.anotados); */

            let cantidadAnotados = 0;

            if (claseObj.claseEsp) {
                cantidadAnotados = claseObj.claseEsp.anotados.length;
            }

            capacidadActual = `${cantidadAnotados}/${claseObj.clase.limiteClase}`;

            celda.dataset.capacidad = capacidadActual;

            //Para informar pedir confirmación si quiere entrar en lista de espera.
            celda.dataset.llena = cantidadAnotados >= claseObj.clase.limiteClase;

            celda.onclick = () => abrirPago(celda);

            switch (claseObj.actividad.nombre) {
                case "Spinning":
                    celda.classList.add("spinning");
                    break;
                case "Yoga":
                    celda.classList.add("yoga");
                    break;
                case "Funcional":
                    celda.classList.add("funcional");
                    break;
                default:
                    celda.classList.add("otro");
                    break;
            }
        }
    });

    // Bauti posta recorreres toda la tabla para poner en sin clase?
    document.querySelectorAll('.slotDeClase').forEach(div => {
        if (div.innerText.trim() === "Sin Clase") {
            div.classList.add("sinclase");
        }
    });
}
