
let clasesData;

getAllClasses();

async function getAllClasses() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET'
    });

    const resData = await res.json();
    clasesData = resData.clases;
    console.log("Desde classSlot.js -> estas son las clases conseguidas de db: ")
    console.log(clasesData);

    clasesData.forEach(claseObj => {

        /* console.log(claseObj); Si empieza a haber errores a la hora de mostrar las clases, usar esto
        para debuggear, Por cada claseGeneral que haya te genera 3 objetos y podes ver cual es
        el que le falta info.
        console.log(claseObj.sala);
        console.log(claseObj.actividad); */

        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);

        if (celda) {
            celda.innerText = claseObj.actividad.nombre;
            celda.dataset.id = claseObj.clase._id; //Para mandar por crearPreferencia
            celda.dataset.clase = claseObj.actividad.nombre;
            celda.dataset.precio = 4; //Esto está hardcodeado -> cambiar en prod. 
            
            /* //Si no tengo clase especifica, significa que no la creé y por lo tanto no tiene alumnos anotados.
            console.log(claseObj.claseEsp);
            console.log(claseObj.claseEsp.anotados); */
            if (claseObj.claseEsp){
                const cant = claseObj.claseEsp.anotados.length;
                capacidadActual = claseObj.claseEsp.anotados.length +"/"+ claseObj.clase.limiteClase; //Cambiar formato.
            }
            else
                capacidadActual = "0/"+claseObj.clase.limiteClase;
            celda.dataset.capacidad = capacidadActual;

            celda.onclick = () => abrirPago(celda);

            switch (claseObj.actividad.nombre) {
                case "spinning":
                    celda.classList.add("spinning");
                    break;
                case "yoga":
                    celda.classList.add("yoga");
                    break;
                case "funcional":
                    celda.classList.add("funcional");
                    break;
                default:
                    celda.classList.add("otro");
                    break;
            }
        }
    });

    document.querySelectorAll('.slotDeClase').forEach(div => {
        if (div.innerText.trim() === "Sin Clase") {
            div.classList.add("sinclase");
        }
    });
}
