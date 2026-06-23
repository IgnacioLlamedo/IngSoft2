let data = {
    clase: "",
    horario: "",
    precio: "",
    tipo: "",
};

const msg = document.getElementById("message");


fetchData();

async function fetchData() {
    // TODO

    // if(resData.success) {
    //     data = resData.data;
    //     loadData()
    // }

    // Esto es provisional, se debe borrar, y enviar los mismos datos que se envían.
    data = {
        clase: "Yoga",
        horario: "Martes 17hs",
        precio: "$800",
        tipo: "Mensual",
    };

    loadData();
    //////////////////////////////////////////////////////////////////////////////////
}


function loadData() {
    const dataContainer = document.getElementById("dataContainer");

    createSpan("Clase", data.clase, dataContainer);
    createSpan("Horario", data.horario, dataContainer);
    createSpan("Precio", data.precio, dataContainer);
    createSpan("Tipo", data.tipo, dataContainer);
}


function createSpan(name, data, dataContainer) {
    const span = document.createElement('span');
    span.textContent = `${name}: ${data}`;

    dataContainer.appendChild(span);
}


document.getElementById("yesOption").addEventListener('click', (event) => {
    event.preventDefault();

    /* 
    const resPref = await fetch('/api/pago/crear-preferencia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            nombre: nombre,
            tipoClase: tipoClase, 
            precio: precio, 
            clases: clasesPago
        })
    });
    const resPreferencia = await resPref.json();
    window.open(resPreferencia.init_point, "_blank"); 
    */
})

document.getElementById("noOption").addEventListener('click', (event) => {
    event.preventDefault();

    /**
     * Rechazar cupo:
     *  -> Inavilitar el cupo.
     *  -> Quitar de la lista a esta persona.
     *  -> Crear cupo de la siguiente persona del mismo tipo (Abonado o No Abonado).
     *  -> Avisarle.
     */


    showMessage("Rechazo realizado con éxito.", true);
})


function showMessage(message, success) {
    msg.hidden = false;
    msg.textContent = message;

    const msgClass = success ? "successMsg" : "errorMsg";
    msg.classList.add(msgClass);
}