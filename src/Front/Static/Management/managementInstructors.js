


// Estas son las únicas cosas que hay que cambiar de este código para adaptarlo // 
// Al profesor le tuve que agregar un control del DNI al crear y modificar      //

const instructorsEndpoint = "/api/admin/profesor"; // Se usa el mismo fetch pero diferenciando entre GET | POST | PUT | DELETE
const activitiesEndpoint = "/api/admin/actividad";

let availableActivities = [];

const slotHtml = (slot) => {
    const activitiesNames = slot.actividades.map(activity => {
            const activityItem = availableActivities.find(item => item._id === activity);
            return `<b>${activityItem.nombre}</b>`;
        }).join(', ');

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

function getSuspendFormData(form) {
    return {
        motivoEstado: form.reasonField.value,
        fechasEstado: {
            desde: form.dateFromInput.value,
            hasta: form.dateToInput.value
        },
    };
}

const fieldsToFillWithSlotData = (slot) => {
    return [
        {id: '#nameField', content: slot.nombre},
        {id: '#dniField', content: slot.dni},
        {id: '#genderField', content: slot.genero},
    ];
};

//////////////////////////////////////////////////////////////////////////////////







const instructorsBtn = document.getElementById('instructorsBtn');

const createForm = document.getElementById("create-form");
const templateEditForm = document.getElementById("edit-form");
const templateSuspendForm = document.getElementById("suspend-form");

const errorMsg = document.getElementById("createError");
const successMsg = document.getElementById("createSuccess");

const slotList = document.getElementById("slotList");
const notDataAvailableMsg = document.getElementById("notDataAvailableMsg");

const dialog = document.getElementById("confirmPanel");

let Status;

window.addEventListener('DOMContentLoaded', async () => {
    instructorsBtn.classList.add("btn-active");
    Status = JSON.parse(createForm.dataset.statusEnum);
    await initializeActivityCheckboxes();
    attachConfirmDialogHandlers();
    getAllSlots();
});

function attachConfirmDialogHandlers() {
    const cancelButton = dialog.querySelector('button[value="cancel"]');
    if (cancelButton) {
        cancelButton.addEventListener('click', () => dialog.close('cancel'));
    }

    const confirmForm = dialog.querySelector('form');
    const reasonInput = dialog.querySelector('#deleteReasonField');
    if (confirmForm && reasonInput) {
        confirmForm.addEventListener('submit', (event) => {
            const reason = reasonInput.value.trim();
            if (!reason) {
                reasonInput.setCustomValidity('Debe ingresar un motivo para borrar el profesor.');
                reasonInput.reportValidity();
                event.preventDefault();
                return;
            }
            reasonInput.setCustomValidity('');
        });

        reasonInput.addEventListener('input', () => {
            reasonInput.setCustomValidity('');
        });
    }
}

async function getAllSlots() {
    const res = await fetch(instructorsEndpoint, {
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
            slotSuspendButton.onclick = () => switchToSuspend(slot);
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
                    const deleteReason = dialog.querySelector('#deleteReasonField')?.value || '';
                    deleteInstructor(closeEvent, slot._id, slotError, slotErrorMsg, deleteReason);
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

    if (data.actividades.length === 0) {
        ErrorMsg("Error al crear el profesor. Debe ingresar al menos una actividad");
        return;
    }

    const dataString = JSON.stringify(data);

    const res = await fetch(instructorsEndpoint, {
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




async function deleteInstructor(event, _id, slotError, slotErrorMsg, motivoEstado) {
    event.preventDefault();

    hideSlotError(slotError);
    
    const data = JSON.stringify({ id: _id, motivoEstado: motivoEstado });

    const res = await fetch(instructorsEndpoint, {
        method: 'DELETE',
        headers: {
            "Content-Type" : "application/json",
        },
        body: data
    });

    const resData = await res.json();

    if (resData.success) {
        showDeleteSuccessDialog("Profesor borrado correctamente.");
        getAllSlots();
    }
    else showSlotError(slotError, slotErrorMsg, resData.message);
}

function showDeleteSuccessDialog(message) {
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
            EditErrorMsg("Error al modificar el profesor. El DNI ingresado debe tener 8 caracteres.");
            return;
        }

        if (data.actividades.length === 0) {
            EditErrorMsg("Error al modificar el profesor. Debe ingresar al menos una actividad.");
            return;
        }

        const dataString = JSON.stringify(data);

        const res = await fetch(instructorsEndpoint, {
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


// SUSPEND FORM //

let suspendForm;
let suspendFormErrorMsg;
let suspendFormSuccesMsg;
let suspendId;



async function switchToSuspend(slot) {
    const templateClone = templateSuspendForm.content.cloneNode(true);
    
    const suspendForm = templateClone.querySelector("form");

    fillFormWithData(suspendForm, slot);

    suspendFormErrorMsg = suspendForm.querySelector("#suspendError");
    suspendFormSuccessMsg = suspendForm.querySelector("#suspendSuccess");

    suspendForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        suspendCleanMsgs();
      
        const profesor = getSuspendFormData(event.target);
        profesor._id = slot._id;
        profesor.estado = Status.INACTIVE;
        profesor.fechasEstado = {
            desde: new Date(profesor.fechasEstado.desde),
            hasta: new Date(profesor.fechasEstado.hasta)
        };
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // !!! fechasEstado.desde TIENE QUE SER MAYOR A HOY !!!
        if (profesor.fechasEstado.desde < today || profesor.fechasEstado.hasta < profesor.fechasEstado.desde) {
            suspendErrorMsg("Error al inhabilitar el profesor. Las fechas ingresadas no son correctas.");
            return;
        }

        const res = await fetch(`${instructorsEndpoint}/inhabilitar`, {
            method: 'PUT',
            headers: {
                "Content-Type" : "application/json",
            },
            body: JSON.stringify(profesor)
        });

        const resData = await res.json();

        if(resData.success) {
            suspendSuccessMsg(resData.message);
            //switchToCreateForm();
            getAllSlots();
        }
        else
            suspendErrorMsg(resData.message);
    });


    const cancelButton = suspendForm.querySelector("#suspendCancel");
    cancelButton.addEventListener("click", (event) => {
        switchToCreateForm();
    });

    currentForm.replaceWith(suspendForm);
    currentForm = suspendForm;
}


function switchToCreateForm() {
    currentForm.replaceWith(createForm);
    currentForm = createForm;
}


async function initializeActivityCheckboxes() {
    try {
        const res = await fetch(activitiesEndpoint, {
            method: 'GET',
            headers: {
                "Content-Type": "application/json",
            },
        });

        const resData = await res.json();

        if (!resData.success) {
            console.error("No se pudieron cargar las actividades.");
            return;
        }

        availableActivities = resData.data;
        renderActivityCheckboxes(createForm, availableActivities, "createActivitiesContainer");
    }
    catch (error) {
        console.error("initializeActivityCheckboxes ERROR:", error);
    }
}

function renderActivityCheckboxes(form, activities, containerId, checkedActivityIds = []) {
    const container = form.querySelector(`#${containerId}`);
    if (!container) return;

    container.innerHTML = '';

    activities.forEach(activity => {
        const checkboxId = `${containerId}-${activity._id}`;
        const isChecked = Array.isArray(checkedActivityIds) && checkedActivityIds.includes(activity._id);

        const label = document.createElement('label');
        label.classList.add('checkbox-mgmt');
        label.innerHTML = `<input type="checkbox" id="${checkboxId}" name="activities" value="${activity._id}" ${isChecked ? 'checked' : ''}> ${activity.nombre}`;

        container.appendChild(label);
    });
}

function fillActivitiesCheckboxes(form, activities = []) {
    const values = Array.isArray(activities) ? activities : [activities];
    renderActivityCheckboxes(form, availableActivities, form.id === 'create-form' ? 'createActivitiesContainer' : 'editActivitiesContainer', values);
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



function suspendSuccessMsg(message) {
    suspendFormErrorMsg.hidden = true;
    suspendFormErrorMsg.textContent = "";

    suspendFormSuccessMsg.textContent = message;
    suspendFormSuccessMsg.hidden = false;
}

function suspendErrorMsg(message) {
    suspendFormSuccessMsg.hidden = true;
    suspendFormSuccessMsg.textContent = "";

    suspendFormErrorMsg.hidden = false;
    suspendFormErrorMsg.textContent = message;
}

function suspendCleanMsgs() {
    suspendFormSuccessMsg.hidden = true;
    suspendFormSuccessMsg.textContent = "";

    suspendFormErrorMsg.hidden = true;
    suspendFormErrorMsg.textContent = "";
}