


// Estas son las únicas cosas que hay que cambiar de este código para adaptarlo //

const endpoint = "/api/admin/clase"; // Se usa el mismo fetch pero diferenciando entre GET | POST | PUT | DELETE

const roomsEndpoint = "/api/admin/sala";
const activitiesEndpoint = "/api/admin/actividad";
const instructorsEndpoint = "/api/admin/profesor";

const slotHtml = (slot) => {return `
    <p>Sala: ${slot.idSala.nombre}</p>
    <p>Actividad: ${slot.idActividad.nombre}</p>
    <p>Día: ${slot.dia}</p>
    <p>Hora: ${slot.hora}</p>
    <p>Cupo máximo: ${slot.limiteClase}</p>
    <p>Profesor: ${slot.idProfesor.nombre}</p>
    <p>Precio cuota: ${slot.idActividad.precioMensual}</p>
`};


function getFormData(form) {
    return {
        idSala: form.room.value,
        idActividad: form.activity.value, // Se puede poner "Yo ga" pero bueno. Haría replaceAll(" ", "") pero entonces no podría existir nada con dos plaabras
        idProfesor: form.instructor.value,
        limiteClase: form.classLimit.value,
        dia: form.day.value,
        hora: form.hour.value,
    }
}

const fieldsToFillWithSlotData = (slot) => {
    return [
        {id: '#roomSelectField', content: slot.idSala._id},
        {id: '#activitySelectField', content: slot.idActividad._id},
        {id: '#instructorSelectField', content: slot.idProfesor._id},
        {id: '#classLimitField', content: slot.limiteClase},
        {id: '#dayField', content: slot.dia},
        {id: '#hourField', content: slot.hora},
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


const roomSelect = document.getElementById("roomSelect");
const activitySelect = document.getElementById("activitySelect");
const instructorSelect = document.getElementById("instructorSelect");


let roomsData = new Map();
let activitiesData;
let instructorsData;

const classLimit = document.getElementById("classLimit");


fetchData();

async function fetchData() {
    const [classesRes, roomsRes, activitiesRes, instructosRes] = await Promise.all([
        fetch(endpoint),
        fetch(roomsEndpoint),
        fetch(activitiesEndpoint),
        fetch(instructorsEndpoint),
    ]);

    const [classesResData, roomsResData, activitiesResData, instructosResData] = await Promise.all([
        classesRes.json(),
        roomsRes.json(),
        activitiesRes.json(),
        instructosRes.json(),
    ]);

    printSlots(classesResData.data);
    loadRoomsOptions(roomsResData.data);
    loadActivitiesOptions(activitiesResData.data);
    loadInstructorsOptions(instructosResData.data);
}

function loadRoomsOptions(rooms) {
    loadOptionsNames(rooms, roomSelect);
    roomsData = rooms;
}

function loadActivitiesOptions(activities) {
    loadOptionsNames(activities, activitySelect);
    activitiesData = activities;
}

function loadInstructorsOptions(instructors) {
    loadOptionsNames(instructors, instructorSelect);
    instructorsData = instructors;
}


function loadOptionsNames(data, selectHTMLElement) {
    const options = data.map((element, index) => {
        return {
            value: element._id,
            name: element.nombre,
        }
    });

    options.forEach(({ value, name }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = name;
        selectHTMLElement.appendChild(option);
    });
}


classLimit.addEventListener('input', (event) => {
    classLimit.value = checkNumberInput(event.target.value);
});


function checkNumberInput(value, lenghtCap) {
    value = value.replace(/[^0-9]/g, "");

    if(value.charAt(0) === '0') value = "1";
    if(lenghtCap !== 0 && value.length > lenghtCap) value = value.slice(0, 2);

    return value;
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

    const slotEditButton = document.createElement("button");
    slotEditButton.classList.add("edit-button");
    slotEditButton.textContent = "Editar";
    slotEditButton.onclick = () => switchToEdit(slot);

    const slotDeleteButton = document.createElement("button");
    slotDeleteButton.classList.add("delete-button");
    slotDeleteButton.type = "button";
    slotDeleteButton.textContent = "Borrar";

    slotDeleteButton.addEventListener('click', () => {
        dialog.showModal();

        dialog.addEventListener('close', (closeEvent) => {
            if (dialog.returnValue === 'default') {
                deleteClass(closeEvent, slot._id, slotError, slotErrorMsg);
            }
        }, { once: true });
    });

    buttonsDiv.appendChild(slotEditButton);
    buttonsDiv.appendChild(slotDeleteButton);

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

    const error = checkErrors(data);
    if(error) {
        ErrorMsg(error);
        return;
    }

    const dataString = JSON.stringify( data );

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
        fetchData();
    }
    else
        ErrorMsg(resData.message);
});


function checkErrors(formData) {
    const roomLimit = getRoomLimit(formData.idSala);
    if(formData.limiteClase > roomLimit)
        return `Error al crear la clase. El límite de clase ingresado es mayor al límite de la sala. El límite de la sala es: ${roomLimit}`;
}

function getRoomLimit(id) {
    let limiteSala = 0;
    roomsData.forEach((room) => {
        if(room._id === id) {
            limiteSala = room.limiteSala;
            return;
        }
    });

    if(limiteSala !== 0)
        return limiteSala;

    throw Error("La clase que se ingresó no está en los datos cargados. Esto nunca debería pasar");
}


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




async function deleteClass(event, _id, slotError, slotErrorMsg) {
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

    if(resData.success) {
        if(isOnEditMode)
            switchToCreateForm();
        fetchData();
    }
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

        let data = getFormData(event.target);
        data.id = slot._id;

        const error = checkErrors(data);
        if(error) {
            EditErrorMsg(error);
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
            fetchData();
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

    isOnEditMode = true;
}


function switchToCreateForm() {
    currentForm.replaceWith(createForm);
    currentForm = createForm;
    isOnEditMode = false;
}



function fillFormWithData(editForm, slot) {
    const formFieldsContent = fieldsToFillWithSlotData(slot);

    // Lógica personal de este archivo //
    const roomSelectField = editForm.querySelector("#roomSelectField");
    const activitySelectField = editForm.querySelector("#activitySelectField");
    const instructorSelectField = editForm.querySelector("#instructorSelectField");

    loadOptionsNames(roomsData, roomSelectField);
    loadOptionsNames(activitiesData, activitySelectField);
    loadOptionsNames(instructorsData, instructorSelectField);
    //////////////////////////////////////

    formFieldsContent.forEach(field => {
        editForm.querySelector(field.id).value = field.content;
    });

    const editLimitClass = editForm.querySelector("#classLimitField");
    editLimitClass.addEventListener('input', (event) => {
        editLimitClass.value = checkNumberInput(event.target.value);
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