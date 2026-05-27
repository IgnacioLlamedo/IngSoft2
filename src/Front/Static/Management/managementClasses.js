
const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotsList = document.getElementById("slotsList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg")

getAllSlots();

async function getAllSlots() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET',
        headers: {
            "Content-Type" : "application/json",
        },
    });

    const resData = await res.json();

    if(resData.success)
        printSlots(resData.clases);
    else
        notDataAvailableMsg.hidden = false;
}




function printSlots(slots) {
    notDataAvailableMsg.hidden = true;

    slotsList.innerHTML = "";

    const lastIndex = slots.length - 1;

    slots.forEach((slot, index) => {
        
        const slotElem = document.createElement("div");
        slotElem.classList.add("slot");

        slotElem.innerHTML =`
            <p>Sala: ${slot.sala.nombre}</p>
            <p>Actividad: ${slot.actividad.nombre}</p>
            <p>Día: ${slot.clase.dia}</p>
            <p>Hora: ${slot.clase.hora}</p>
            <p>Cupo máximo: ${slot.clase.limiteClase}</p>
            <p>Profesor: ${slot.profesor.nombre}</p>
            <p>Precio: ${slot.clase.precioMensual}</p>
        `;

        slotsList.appendChild(slotElem);

        if(index !== lastIndex) {
            const separator = document.createElement("hr");
            separator.classList.add("separator");
            slotsList.appendChild(separator);
        }
    });
}





document.getElementById("new-clase-form").addEventListener("submit", async (event) => {

    event.preventDefault();
    CleanMsgs();

    const form = event.target;

    return; // sacar
    const data = {
        
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/admin/profesor", {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json",
        },
        body: dataString
    });

    const resData = await res.json();

    if(resData.success) {
        SuccessMsg(resData.message);
        getAllSlots();
    }
    else
        ErrorMsg(resData.message);
});



function SuccessMsg(message) {
    errorMsg.hidden = true;
    errorMsg.textContent = "";

    successMsg.textContent = message;
    successMsg.hidden = false;
}

function ErrorMsg(message) {
    successMsg.hidden = true;
    successMsg.textContent = "";

    errorMsg.hidden = false;
    errorMsg.textContent = message;
}

function CleanMsgs() {
    successMsg.hidden = true;
    successMsg.textContent = "";

    errorMsg.hidden = true;
    errorMsg.textContent = "";
}