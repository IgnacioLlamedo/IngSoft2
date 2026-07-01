const managementBtn = document.getElementById('managementBtn');
const submitButton = document.getElementById("submit");
const cancelButton = document.getElementById("cancel");
const successMsg = document.getElementById("editSuccess");
const errorMsg = document.getElementById("editError");

const daysInput = document.getElementById("days");

const sendNotification = document.getElementById("notification");
const notificationSuccessMsg = document.getElementById("notificationSuccessMsg");
const notificationErrorMsg = document.getElementById("notificationErrorMsg");

setInputDisabled(true);
fetchData();

function setInputDisabled(state) {
    daysInput.disabled = state;
    cancelButton.hidden = state;
}


async function fetchData() {
    const [daysRes] = await Promise.all([
        fetch("/api/admin/diasaviso"),
    ]);

    const [daysResData] = await Promise.all([
        daysRes.json(),
    ]);

    daysInput.value = daysResData.data.diasAviso;
}

window.addEventListener('DOMContentLoaded', () => {
    managementBtn.classList.add("btn-active");
});


function checkNumberInput(value, lenghtCap) {
    value = value.replace(/[^0-9]/g, "");

    if(value.charAt(0) === '0') value = "1";
    if(lenghtCap !== 0 && value.length > lenghtCap) value = value.slice(0, 2);

    return value;
}

daysInput.addEventListener('input', (event) => {
    event.preventDefault();
    daysInput.value = checkNumberInput(event.target.value, 2);
})


function checkNumberInputOnChange(value) {
    if(value.length === 0) value = "1";

    daysInput.value = value;
}

daysInput.addEventListener('change', (event) => {
    event.preventDefault();
    checkNumberInputOnChange(event.target.value);
})


submitButton.addEventListener('click', (event) => {
    event.preventDefault();
    toggleEditMode();

    if(!isOnEditMode)
        saveData();
});

cancelButton.addEventListener('click', (event) => {
    event.preventDefault();
    toggleEditMode();

    resetValues();
});

sendNotification.addEventListener('click', async (event) => {
    const res = await fetch('/api/admin/enviar');
    const resData = await res.json();

    if(resData.success)
        SuccessMsg(resData.message, notificationSuccessMsg);
    else
        ErrorMsg(resData.message, notificationErrorMsg);
})


let isOnEditMode = false;
function toggleEditMode() {
    isOnEditMode = !isOnEditMode
    if(isOnEditMode)
        enterEditMode();
    else
        exitEditMode();
}

function enterEditMode() {
    daysInitValue = daysInput.value;

    setInputDisabled(false);
    submitButton.textContent = "Guardar cambios";
}

function exitEditMode() {
    setInputDisabled(true);
    submitButton.textContent = "Editar";
}

let daysInitValue;
function resetValues() {
    daysInput.value = daysInitValue;
}


async function saveData() {
    const [daysSuccess, daysMessage] = await saveDays();
    if(!daysSuccess) {
        ErrorMsg(daysMessage, errorMsg);
        return;
    }

    SuccessMsg("¡Cambios realizados con éxito!", successMsg);
}



async function saveDays() {
    const daysRes = await fetch("/api/admin/diasaviso", {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify({
            diasAviso: daysInput.value,
        })
    });

    const daysResData = await daysRes.json();

    return [daysResData.success, daysResData.success ? "" : daysResData.message];
}



function SuccessMsg(message, elem) {
    hideErrorMsg(elem);

    elem.textContent = message;
    elem.hidden = false;
}

function ErrorMsg(message, elem) {
    hideSuccessMsg(elem);

    elem.hidden = false;
    elem.textContent = message;
}

function CleanMsgs(elem) {
    hideSuccessMsg(elem);
    hideErrorMsg(elem);
}

function hideErrorMsg(elem) {
    elem.hidden = true;
    elem.textContent = "";
}

function hideSuccessMsg(elem) {
    elem.hidden = true;
    elem.textContent = "";
}