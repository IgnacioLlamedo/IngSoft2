const classesBtn = document.getElementById('classesBtn');

const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotList = document.getElementById("slotList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg")


window.addEventListener('DOMContentLoaded', () => {
    classesBtn.classList.add("btn-active");
});

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

    slotList.innerHTML = "";

    const lastIndex = slots.length - 1;

    slots.forEach((slot, index) => {
        
        const slotElem = document.createElement("div");
        slotElem.classList.add("slot");

        const slotData = document.createElement("div");
        slotData.classList.add("slot-data");

        slotData.innerHTML =`
            <p>Sala: ${slot.sala.nombre}</p>
            <p>Actividad: ${slot.actividad.nombre}</p>
            <p>Día: ${slot.clase.dia}</p>
            <p>Hora: ${slot.clase.hora}</p>
            <p>Cupo máximo: ${slot.clase.limiteClase}</p>
            <p>Profesor: ${slot.profesor.nombre}</p>
            <p>Precio: ${slot.clase.precioMensual}</p>
        `;

        const slotError = document.createElement("div");
        slotError.classList.add("slot-error");
        slotError.classList.add("none");

        const errorHr = document.createElement("hr");
        const errorMsg = document.createElement("p");
        errorMsg.classList.add("errorMsg");

        slotError.appendChild(errorHr);
        slotError.appendChild(errorMsg);

        const buttonsDiv = document.createElement("div");
        buttonsDiv.classList.add("buttons-container");

        const slotEditButton = document.createElement("button");
        slotEditButton.classList.add("edit-button");
        slotEditButton.textContent = "Editar";
        /* slotEditButton.onclick = () => switchToEdit(slot.nombre, slot.dni, slot.genero, slot._id); */

        const slotDeleteButton = document.createElement("button");
        slotDeleteButton.classList.add("delete-button");
        slotDeleteButton.type = "button";
        slotDeleteButton.textContent = "Borrar";

        /* slotDeleteButton.addEventListener('click', () => {
            const dialog = document.getElementById('confirmPanel');
            if (!dialog) {
                // Fallback: no dialog present, delete immediately
                deleteActivity(null, slot._id, slotError, errorMsg);
                return;
            }

            dialog.showModal();

            dialog.addEventListener('close', (closeEvent) => {
                if (dialog.returnValue === 'default') {
                    // pass the close event (may be null) — deleteActivity guards event usage
                    deleteActivity(closeEvent, slot._id, slotError, errorMsg);
                }
            }, { once: true });
        }); */


        buttonsDiv.appendChild(slotEditButton);
        buttonsDiv.appendChild(slotDeleteButton);
        slotData.appendChild(buttonsDiv);

        slotElem.appendChild(slotData);
        slotElem.appendChild(slotError);

        slotList.appendChild(slotElem);

        if(index !== lastIndex) {
            const separator = document.createElement("hr");
            separator.classList.add("separator");
            slotList.appendChild(separator);
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