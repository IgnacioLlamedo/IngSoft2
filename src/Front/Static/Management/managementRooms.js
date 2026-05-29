
const createForm = document.getElementById("new-room-form");
const templateEditForm = document.getElementById("edit-room-form");

const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotsList = document.getElementById("slotsList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg")

getAllSlots();

async function getAllSlots() {
    const res = await fetch("/api/admin/sala", {
        method: 'GET',
        headers: {
            "Content-Type" : "application/json",
        },
    });

    const resData = await res.json();

    if(resData.success)
        printSlots(resData.rooms);
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

        const slotData = document.createElement("div");
        slotData.classList.add("slot-data");

        slotData.innerHTML =`
            <p>Nombre: ${slot.nombre}</p>
            <p>Cupo máximo: ${slot.limiteSala}</p>
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
        slotEditButton.onclick = () => switchToEdit(slot.nombre, slot.limiteSala, slot._id);

        const slotDeleteButton = document.createElement("button");
        slotDeleteButton.classList.add("delete-button");
        slotDeleteButton.type = "button";
        slotDeleteButton.textContent = "Borrar";

        slotDeleteButton.addEventListener('click', () => {
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
        });

        buttonsDiv.appendChild(slotEditButton);
        buttonsDiv.appendChild(slotDeleteButton);
        slotData.appendChild(buttonsDiv);

        slotElem.appendChild(slotData);
        slotElem.appendChild(slotError);

        slotsList.appendChild(slotElem);

        if(index !== lastIndex) {
            const separator = document.createElement("hr");
            separator.classList.add("separator");
            slotsList.appendChild(separator);
        }
    });
}





document.getElementById("new-room-form").addEventListener("submit", async (event) => {

    event.preventDefault();
    CleanMsgs();

    const form = event.target;

    const data = {
        nombre: form.name.value,
        limiteSala: form.limit.value,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/admin/sala", {
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

















async function deleteActivity(event, _id, slotError, errorMsg) {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();

    slotError.classList.add("none");

    const data = {
        id: _id,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/admin/sala", {
        method: 'DELETE',
        headers: {
            "Content-Type" : "application/json",
        },
        body: dataString
    });

    const resData = await res.json();

    if(resData.success)
        getAllSlots();
    else {
        errorMsg.textContent = resData.message;
        slotError.classList.remove("none");
    }
}




// EDIT FORM

let currentForm = createForm;

let editForm;
let editFormErrorMsg;
let editFormSuccesMsg;
let editId;


async function switchToEdit(name, limit, id) {
    const templateClone = templateEditForm.content.cloneNode(true);
    
    editForm = templateClone.querySelector("form");
    editId = id;

    const editNameField = editForm.querySelector("#nameField");
    editNameField.value = name;

    const editLimitField = editForm.querySelector("#limitField");
    editLimitField.value = limit;

    editFormErrorMsg = editForm.querySelector("#editError");
    editFormSuccessMsg = editForm.querySelector("#editSuccess");

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        EditCleanMsgs();

        const form = event.target;
        const data = {
            id: editId,
            nombre: form.name.value,
            limiteSala: Number(form.limit.value),
        }

        const dataString = JSON.stringify(data);

        const res = await fetch("/api/admin/sala", {
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json",
            },
            body: dataString
        });

        const resData = await res.json();

        if(resData.success) {
            EditSuccessMsg(resData.message);
            getAllSlots();
        }
        else
            EditErrorMsg(resData.message);
    });


    const cancelButton = editForm.querySelector("#editCancel");
    cancelButton.addEventListener("click", (event) => {
        switchToCreateForm();
    });

    currentForm.replaceWith(editForm);
    currentForm = editForm;
}


function switchToCreateForm() {
    currentForm.replaceWith(createForm);
    currentForm = createForm;
}




function EditSuccessMsg(message) {
    editFormErrorMsg.hidden = true;
    editFormErrorMsg.textContent = "";

    editFormSuccessMsg.textContent = message;
    editFormSuccessMsg.hidden = false;
}

function EditErrorMsg(message) {
    editFormSuccessMsg.hidden = true;
    editFormSuccessMsg.textContent = "";

    editFormErrorMsg.hidden = false;
    editFormErrorMsg.textContent = message;
}

function EditCleanMsgs() {
    editFormSuccessMsg.hidden = true;
    editFormSuccessMsg.textContent = "";

    editFormErrorMsg.hidden = true;
    editFormErrorMsg.textContent = "";
}