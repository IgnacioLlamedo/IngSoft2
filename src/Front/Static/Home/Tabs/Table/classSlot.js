
let clasesData;

getAllClasses();

async function getAllClasses() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET'
    });

    const resData = await res.json();
    clasesData = resData.clases;
    /* console.log("Desde classSlot.js -> estas son las clases conseguidas de db: ")
    console.log(clasesData); */

    clasesData.forEach(claseObj => {

        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);

        if (celda) {
            celda.innerText = claseObj.actividad.nombre;
            celda.dataset.id = claseObj.clase._id; //Para mandar por crearPreferencia
            celda.dataset.clase = claseObj.actividad.nombre;
            celda.dataset.precio = 1; //Esto está hardcodeado -> cambiar en prod. 
/* 
            //No es top-level moduel, no se puede hacer fetch -> eliminar.
            const esp = await fetch("/api/clases/conseguir-especifica", {
                method: 'GET',
                body: JSON.stringify(claseObj.clase._id)
            })
            const resEsp = await res.json(); */
            let capacidadActual;

            //Si no tengo clase especifica, significa que no la creé y por lo tanto no tiene alumnos anotados.
/*             console.log(claseObj.claseEsp);
            console.log(claseObj.claseEsp.anotados); */
            if (claseObj.claseEsp){
                const cant = claseObj.claseEsp.anotados.length;
                /* console.log("La capacidad de la clase actual conseguida es: " + cant); //resEsp.capacidad);
                console.log(claseObj.claseEsp.anotados);
                console.log(typeof(claseObj.claseEsp.anotados))
                console.log(claseObj.claseEsp.anotados.length); */
                capacidadActual = claseObj.claseEsp.anotados.length +"/"+ claseObj.clase.limiteClase; //Cambiar formato.
            }
            else
                capacidadActual = "0/"+claseObj.clase.limiteClase;
            celda.dataset.capacidad = capacidadActual;

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

    document.querySelectorAll('.slotDeClase').forEach(div => {
        if (div.innerText.trim() === "Sin Clase") {
            div.classList.add("sinclase");
        }
    });
}
