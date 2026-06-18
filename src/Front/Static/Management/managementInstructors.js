


// Estas son las únicas cosas que hay que cambiar de este código para adaptarlo // 
// Al profesor le tuve que agregar un control del DNI al crear y modificar      //

const endpoint = "/api/admin/profesor"; // Se usa el mismo fetch pero diferenciando entre GET | POST | PUT | DELETE


const slotHtml = (slot) => {

    // TODO: Obtener nombres de actividades
    const activitiesNames = slot.actividades.map(activity => "<b>" + activity.slice(0, 6) + '</b>').join(', ');

    let statusHtml = slot.estado === Status.REGISTERED
            ? `<b>${slot.estado}</b>`
            : `<b>${slot.estado}</b> con motivo <i>"${slot.motivoEstado}"</i>`;
    const fechasHtml = slot.fechasEstado.hasta == null
            ? `<br>Ocurrido el <b>${new Date(slot.fechasEstado.desde).toLocaleString('es-AR')}</b>`
            : `<br>Desde <b>${new Date(slot.fechasEstado.desde).toLocaleString('es-AR')}</b> hasta <b>${new Date(slot.fechasEstado.hasta).toLocaleString('es-AR')}</b>`;
    statusHtml += fechasHtml;

    const innerHtml = `
        <p><u>Nombre:</u> <b>${slot.nombre}</b></p>
        <p><u>DNI:</u> <b>${slot.dni}</b></p>
        <p><u>Género:</u> <b>${slot.genero}</b></p>
        <p><u>Actividades:</u> ${activitiesNames}</p>
        <p><u>Estado:</u> ${statusHtml}</p>
    `;
    return innerHtml;
};


function getFormData(form) {
    return {
        nombre: form.name.value,
        dni: form.dni.value,
        genero: form.gender.value,
        actividades: Array.from(form.querySelectorAll('input[name="activities"]:checked')).map(input => input.value),
    }
}


const fieldsToFillWithSlotData = (slot) => {
    return [
        {id: '#nameField', content: slot.nombre},
        {id: '#dniField', content: slot.dni},
        {id: '#genderField', content: slot.genero},
    ];
};

//////////////////////////////////////////////////////////////////////////////////









const createForm = document.getElementById("create-form");
const templateEditForm = document.getElementById("edit-form");

const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotList = document.getElementById("slotList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg");

const dialog = document.getElementById("confirmPanel");

let Status;

window.addEventListener('DOMContentLoaded', () => {
    Status = JSON.parse(createForm.dataset.statusEnum);
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

    if (slot.estado !== Status.DELETED) {
        if (slot.estado === Status.REGISTERED) {
            const slotSuspendButton = document.createElement("button");
            slotSuspendButton.classList.add("suspend-button");
            slotSuspendButton.textContent = "Inhabilitar";
            // TODO: Implementar inhabilitación/suspención de profesores (formulario, etc.)
            // y conectar con inhabilitarProfesor() en admin.controller
            // slotSuspendButton.onclick = () => switchToSuspend(slot);
            buttonsDiv.appendChild(slotSuspendButton);
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
            dialog.showModal();
    
            dialog.addEventListener('close', (closeEvent) => {
                if (dialog.returnValue === 'default') {
                    deleteActivity(closeEvent, slot._id, slotError, slotErrorMsg);
                }
            }, { once: true });
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

    const data = getFormData(event.target);
    data.estado = Status.REGISTERED;
    data.fechasEstado = { desde: Date.now(), hasta: null };
    data.motivoEstado = "Registrado vía sistema de gestión";

    if(data.dni.length !== 8) {
        ErrorMsg("Error al crear el profesor. El DNI ingresado debe tener 8 caracteres");
        return;
    }

    const dataString = JSON.stringify(data);

    const res = await fetch(endpoint, {
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




async function deleteActivity(event, _id, slotError, slotErrorMsg) {
    event.preventDefault();

    hideSlotError(slotError);
    
    const data = JSON.stringify({ id: _id });

    const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: {
            "Content-Type" : "application/json",
        },
        body: data
    });

    const resData = await res.json();

    if(resData.success)
        getAllSlots();
    else
        showSlotError(slotError, slotErrorMsg, resData.message);
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

        if(data.dni.length !== 8) {
            EditErrorMsg("Error al modificar el profesor. El DNI ingresado debe tener 8 caracteres");
            return;
        }

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
}


function switchToCreateForm() {
    currentForm.replaceWith(createForm);
    currentForm = createForm;
}


// TODO: Terminar esto y controlar que se guarden/carguen bien
function fillActivitiesCheckboxes(form, activities = []) {
    const values = Array.isArray(activities) ? activities : [activities];
    const checkboxes = form.querySelectorAll('input[name="activities"]');

    checkboxes.forEach(checkbox => {
        checkbox.checked = values.includes(checkbox.value);
    });
}

function fillFormWithData(editForm, slot) {
    const formFieldsContent = fieldsToFillWithSlotData(slot);

    formFieldsContent.forEach(field => {
        const element = editForm.querySelector(field.id);
        if (!element) return;
        element.value = field.content;
    });

    fillActivitiesCheckboxes(editForm, slot.actividades);
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