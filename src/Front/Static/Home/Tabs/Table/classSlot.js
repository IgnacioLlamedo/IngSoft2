
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

        console.log(claseObj); /*Si empieza a haber errores a la hora de mostrar las clases, usar esto
        para debuggear, Por cada claseGeneral que haya te genera 3 objetos y podes ver cual es
        el que le falta info.*/
        /* console.log(claseObj.sala);
        console.log(claseObj.actividad);
        console.log(claseObj.profesor);
        console.log(claseObj.claseEsp); */

        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);
        
        console.log("El tdId que busca el query actual es: ")
        console.log(tdId);
        console.log("La data sala que busca el query actual es: ");
        console.log(claseObj.sala.nombre);

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
