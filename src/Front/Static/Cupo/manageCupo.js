let cupoData;

const parametrosURL = new URLSearchParams(window.location.search);
const cupoID = parametrosURL.get('idCupo');

const msg = document.getElementById("message");


fetchData();

async function fetchData() {
    const res = await fetch(`/api/cupo/get?idCupo=${cupoID}`);
    const resData = await res.json();

    if(resData.success) {   
        cupoData = resData.data;
        if(checkCupoState())
            loadData();
    }

    else {
        InvalidCupo(resData.message)
    }
}


function checkCupoState() {
    if(cupoData.state === 'pendiente') return true;

    InvalidCupo(
        cupoData.state === 'aceptado'
            ? "Error al cargar cupo. El cupo ya fue aceptado."
            : "Error al cargar cupo. El cupo ya fue rechazado."
    )

    return false;
}


function loadData() {
    const dataContainer = document.getElementById("dataContainer");

    createSpan("Clase", cupoData.activity, dataContainer);
    createSpan("Horario", `${cupoData.day} ${cupoData.hour}`, dataContainer);
    createSpan("Precio", cupoData.price, dataContainer);
    createSpan("Tipo", cupoData.type, dataContainer);
}


function createSpan(name, data, dataContainer) {
    const span = document.createElement('span');
    span.textContent = `${name}: ${data}`;

    dataContainer.appendChild(span);
}


document.getElementById("yesOption").addEventListener('click', async (event) => {
    event.preventDefault();

    if(!checkCupoState()) return;

    const classesToPay = getClassestoPay();

    const data = {
        nombre: cupoData.activity,
        tipoClase: cupoData.type, 
        precio: cupoData.price,
        clases: classesToPay,
        idCupo: cupoID,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch('/api/pago/crear-preferencia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: dataString
    });

    const resData = await res.json();
    window.open(resData.init_point, "_blank");
})

document.getElementById("noOption").addEventListener('click', async (event) => {
    event.preventDefault();

    const res = await fetch('/api/cupo/reject', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCupo: cupoID })
    });

    const resData = await res.json();

    if(resData.success) {
        cupoData.state = 'rechazado'
        showMessage("Rechazo realizado con éxito.", true);
    }

    else 
        showMessage(resData.message, false);
})


function showMessage(message, success) {
    msg.hidden = false;
    msg.textContent = message;

    const msgClass = success ? "successMsg" : "errorMsg";
    msg.classList.add(msgClass);
}


function InvalidCupo(message) {
    const errorMsg = document.createElement('span');
    errorMsg.textContent = message;
    errorMsg.classList.add("errorMsg");

    document.querySelector(".form-card").remove();
    document.querySelector("main").appendChild(errorMsg);
}


function getClassestoPay() {
    return cupoData.specificClasses.map(specificClass => ({
        idClaseGeneral: cupoData.idGeneralClass,
        fechaEspecifica: specificClass.fechaEspecifica,
    }));
}

















/* createCupo() //DEBUG
async function createCupo() {
    const data = {
        idUsuario: "878e3bdd-b1ab-4df4-8677-98d210df4a42",
        clasesEspecificas: [
            "f8298c7d-01a1-436a-9c03-fb81ca166d4c", "b33f1e37-cb9c-4d7c-bd27-8abb66f17868", "a3890b52-2075-43de-a055-1181ef0fd2a0", "84067473-45dd-4d65-9d91-eb7ad55752d9"
        ],
        estado: 'pendiente',
        tipo: "mensual",
    }



    await fetch("/api/cupo/create", {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            data: data
        })
    })
} */