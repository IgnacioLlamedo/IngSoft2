
let clasesData;

getAllClasses();

async function getAllClasses() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET'
    });

    const resData = await res.json();
    clasesData = resData.clases;

    clasesData.forEach(claseObj => {

        const tdId = `${claseObj.clase.dia}-${claseObj.clase.hora}`;

        const celda = document.querySelector(`#${tdId} [data-sala="${claseObj.sala.nombre}"]`);

        if (celda) {
            celda.innerText = claseObj.actividad.nombre;
            celda.dataset.id = claseObj.clase._id;
            celda.dataset.clase = claseObj.actividad.nombre;
            celda.dataset.precio = 1;
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
