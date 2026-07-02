


// Estas son las únicas cosas que hay que cambiar de este código para adaptarlo //

const endpoint = "/api/admin/sala"; // Se usa el mismo fetch pero diferenciando entre GET | POST | PUT | DELETE


const slotHtml = (slot) => {
    let statusHtml = slot.estado != null
        ? `<b>${slot.estado}</b>`
        : '';
        //: `<b>${slot.estado}</b> con motivo <i>"${slot.motivoEstado}"</i>`;
    const fechaHtml = slot.fechaEstado != null
        ? `<br>Ocurrido el <b>${new Date(slot.fechaEstado).toLocaleDateString('es-AR')}</b>`
        : '';
    statusHtml += fechaHtml;
    return `
    <p><u>Nombre:</u> <b>${slot.nombre}</b></p>
    <p><u>Cupo máximo:</u> <b>${slot.limiteSala}</b></p>
    <p><u>Estado:</u> ${statusHtml}</p>
`};


function getFormData(form) {
    return {
        nombre: form.name.value,
        limiteSala: Number(form.limit.value),
    }
}


const fieldsToFillWithSlotData = (slot) => {
    return [
        {id: '#nameField', content: slot.nombre},
        {id: '#limitField', content: slot.limiteSala},
    ];
};

//////////////////////////////////////////////////////////////////////////////////







const roomsBtn = document.getElementById('roomsBtn');

const createForm = document.getElementById("create-form");
const templateEditForm = document.getElementById("edit-form");

const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotList = document.getElementById("slotList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg");

const dialog = document.getElementById("confirmPanel");
const confirmText = document.getElementById("confirmText");
const confirmBtn = document.getElementById("confirmBtn");

let currentDialogCloseHandler = null;
function setDialogCloseHandler(handler) {
    if (currentDialogCloseHandler) {
        dialog.removeEventListener('close', currentDialogCloseHandler);
        currentDialogCloseHandler = null;
    }
    currentDialogCloseHandler = handler;
    dialog.addEventListener('close', currentDialogCloseHandler, { once: true });
}


window.addEventListener('DOMContentLoaded', () => {
    roomsBtn.classList.add("btn-active");
});

getAllSlots();

async function getAllSlots() {
    const res = await fetch(endpoint, {
        method: 'GET',
        headers: {
            "Content-Type" : "application/json",
        },
    });

    const resData = await res.json();

    if(resData.success)
        printSlots(resData.data);
    else
        notDataAvailableMsg.hidden = false;
}


function printSlots(slots) {
    notDataAvailableMsg.hidden = true;

    slotList.innerHTML = "";

    const lastIndex = slots.length - 1;

    slots.forEach((slot, index) => {

        const slotElem = createSlotElem();
        const slotData = createSlotData(slot);
    
        const [slotError, slotErrorMsg] = createSlotError(slotElem);
        createEditAndDeleteButtons(slotData, slotError, slotErrorMsg, slot);

        slotElem.appendChild(slotData);
        slotElem.appendChild(slotError);
        
        slotList.appendChild(slotElem);

        createSeparator(slotList, index, lastIndex);

    });
}


function createSlotElem() {
    const slotElem = document.createElement("div");
    slotElem.classList.add("slot");

    return slotElem;
}


function createSlotData(slot) {
    const slotData = document.createElement("div");
    slotData.classList.add("slot-data");

    slotData.innerHTML = slotHtml(slot);

    return slotData;
}


function createEditAndDeleteButtons(slotData, slotError, slotErrorMsg, slot) {
    const buttonsDiv = document.createElement("div");
    buttonsDiv.classList.add("buttons-container");

    if (slot.estado !== "borrada") {
        if (slot.estado === "habilitada") {
            const slotSuspendButton = document.createElement("button");
            slotSuspendButton.classList.add("suspend-button");
            slotSuspendButton.textContent = "Inhabilitar";
            buttonsDiv.appendChild(slotSuspendButton);
            
            slotSuspendButton.addEventListener('click', () => {
                confirmText.textContent = "¿Desea inhabilitar la sala?";
                confirmBtn.textContent = "Inhabilitar Sala";

                setDialogCloseHandler((closeEvent) => {
                    if (dialog.returnValue === 'default') {
                        suspendRoom(closeEvent, slot._id, slotError, slotErrorMsg);
                    }
                });

                dialog.showModal();
            });
        }
        else if (slot.estado === "inhabilitada") {
            const slotResumeButton = document.createElement("button");
            slotResumeButton.classList.add("suspend-button");
            slotResumeButton.textContent = "Habilitar";
            buttonsDiv.appendChild(slotResumeButton);

            slotResumeButton.addEventListener('click', () => {
                confirmText.textContent = "¿Desea habilitar la sala?";
                confirmBtn.textContent = "Habilitar Sala";

                setDialogCloseHandler((closeEvent) => {
                    if (dialog.returnValue === 'default') {
                        resumeRoom(closeEvent, slot._id, slotError, slotErrorMsg);
                    }
                });

                dialog.showModal();
            });
        }
        const slotEditButton = document.createElement("button");
        slotEditButton.classList.add("edit-button");
        slotEditButton.textContent = "Editar";
        slotEditButton.onclick = () => switchToEdit(slot);
        buttonsDiv.appendChild(slotEditButton);

        const slotDeleteButton = document.createElement("button");
        slotDeleteButton.classList.add("delete-button");
        slotDeleteButton.type = "button";
        slotDeleteButton.textContent = "Borrar";
        buttonsDiv.appendChild(slotDeleteButton);

        slotDeleteButton.addEventListener('click', () => {
            confirmText.textContent = "¿Está seguro de que desea borrar la sala?";
            confirmBtn.textContent = "Borrar Sala";

            setDialogCloseHandler((closeEvent) => {
                if (dialog.returnValue === 'default') {
                    deleteRoom(closeEvent, slot._id, slotError, slotErrorMsg);
                }
            });
            
            dialog.showModal();
        });
        
    }

    slotData.appendChild(buttonsDiv);
}


function createSlotError(slotElem) {
    const slotError = document.createElement("div");
    slotError.classList.add("slot-error");
    slotError.classList.add("none");

    const slotErrorHr = document.createElement("hr");
    const slotErrorMsg = document.createElement("p");
    slotErrorMsg.classList.add("errorMsg");

    slotError.appendChild(slotErrorHr);
    slotError.appendChild(slotErrorMsg);

    return [slotError, slotErrorMsg];
}


function createSeparator(slotList, index, lastIndex) {
    if(index !== lastIndex) {
        const separator = document.createElement("hr");
        separator.classList.add("separator");
        slotList.appendChild(separator);
    }
}





createForm.addEventListener("submit", async (event) => {

    event.preventDefault();
    CleanMsgs();

    const data = JSON.stringify( getFormData(event.target) );

    const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json",
        },
        body: data
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
    hideErrorMsg();

    successMsg.textContent = message;
    successMsg.hidden = false;
}

function ErrorMsg(message) {
    hideSuccessMsg();

    errorMsg.hidden = false;
    errorMsg.textContent = message;
}

function CleanMsgs() {
    hideSuccessMsg();
    hideErrorMsg();
}

function hideErrorMsg() {
    errorMsg.hidden = true;
    errorMsg.textContent = "";
}

function hideSuccessMsg() {
    successMsg.hidden = true;
    successMsg.textContent = "";
}




async function deleteRoom(event, _id, slotError, slotErrorMsg) {
    event.preventDefault();

    hideSlotError(slotError);
    
    const roomData = { id: _id, motivoEstado: "Borrada vía sistema de gestión" };

    const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(roomData)
    });

    const resData = await res.json();

    if (resData.success) {
        if(isOnEditMode)
            switchToCreateForm();

        showSuccessDialog("Sala borrada correctamente.");
        getAllSlots();
    }
    else showSlotError(slotError, slotErrorMsg, resData.message);
}


async function suspendRoom(event, _id, slotError, slotErrorMsg) {
    event.preventDefault();

    hideSlotError(slotError);
    
    const roomData = { _id: _id };

    const res = await fetch(`${endpoint}/inhabilitar`, {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(roomData)
    });

    const resData = await res.json();

    if (resData.success) {
        if(isOnEditMode)
            switchToCreateForm();

        showSuccessDialog("Sala inhabilitada correctamente.");
        getAllSlots();
    }
    else showSlotError(slotError, slotErrorMsg, resData.message);
}


async function resumeRoom(event, _id, slotError, slotErrorMsg) {
    event.preventDefault();

    hideSlotError(slotError);
    
    const roomData = { _id: _id};

    const res = await fetch(`${endpoint}/habilitar`, {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(roomData)
    });

    const resData = await res.json();

    if (resData.success) {
        if(isOnEditMode)
            switchToCreateForm();

        showSuccessDialog("Sala habilitada correctamente.");
        getAllSlots();
    }
    else showSlotError(slotError, slotErrorMsg, resData.message);
}

function showSuccessDialog(message) {
    const overlay = document.createElement('div');
    overlay.classList.add('delete-success-overlay');

    const dialog = document.createElement('div');
    dialog.classList.add('delete-success-dialog');

    const text = document.createElement('p');
    text.classList.add('delete-success-text');
    text.textContent = message;

    const button = document.createElement('button');
    button.type = 'button';
    button.classList.add('delete-success-button');
    button.textContent = 'Cerrar';

    button.addEventListener('click', () => {
        overlay.remove();
    });

    overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
            overlay.remove();
        }
    });

    dialog.appendChild(text);
    dialog.appendChild(button);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}

function hideSlotError(slotError) {
    slotError.classList.add("none");
}

function showSlotError(slotError, slotErrorMsg, message) {
    slotErrorMsg.textContent = message;
    slotError.classList.remove("none");
}




// EDIT FORM //

let currentForm = createForm;
let isOnEditMode = false;

let editForm;
let editFormErrorMsg;
let editFormSuccesMsg;
let editId;


async function switchToEdit(slot) {
    const templateClone = templateEditForm.content.cloneNode(true);
    
    const editForm = templateClone.querySelector("form");

    fillFormWithData(editForm, slot);

    editFormErrorMsg = editForm.querySelector("#editError");
    editFormSuccessMsg = editForm.querySelector("#editSuccess");

    editForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        EditCleanMsgs();

        let data =  getFormData(event.target);
        data.id = slot._id;

        const dataString = JSON.stringify(data);

        const res = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json",
            },
            body: dataString
        });

        const resData = await res.json();

        if(resData.success) {
            EditSuccessMsg(resData.message);
            //switchToCreateForm();
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
    
    const mountedNameField = currentForm.querySelector("#nameField");
    if (mountedNameField) mountedNameField.focus();

    isOnEditMode = true;
}


function switchToCreateForm() {
    currentForm.replaceWith(createForm);
    currentForm = createForm;

    isOnEditMode = false;
}



function fillFormWithData(editForm, slot) {
    const formFieldsContent = fieldsToFillWithSlotData(slot);

    formFieldsContent.forEach(field => {
        editForm.querySelector(field.id).value = field.content;
    });
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