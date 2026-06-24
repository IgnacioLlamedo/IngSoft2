const submitButton = document.getElementById("submit");
const cancelButton = document.getElementById("cancel");
const successMsg = document.getElementById("editSuccess");
const errorMsg = document.getElementById("editError");

const daysInput = document.getElementById("days");

const activityNameSelect = document.getElementById("activityName");
const activityPriceInput = document.getElementById("activityPrice");
let activitiesData;
let activitiesPriceTemp;

setInputDisabled(true);
fetchData();


function setInputDisabled(state) {
    daysInput.disabled = state;
    activityPriceInput.disabled = state;
    cancelButton.hidden = state;
}


async function fetchData() {
    const [daysRes, activitiesRes] = await Promise.all([
        fetch("/api/admin/diasaviso"),
        fetch("/api/admin/actividad"),
    ]);

    const [daysResData, activitiesResData] = await Promise.all([
        daysRes.json(),
        activitiesRes.json(),
    ]);

    daysInput.value = daysResData.data.diasAviso;
    loadActivitiesOptions(activitiesResData.data);
}


function loadActivitiesOptions(data) {
    
    const options = data.map((activity, index) => {
        return {
            value: index,
            name: activity.nombre,
        }
    });

    activitiesData = data;
    activityPriceInput.value = activitiesData[0].precioMensual;

    options.forEach(({ value, name }) => {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = name;
        activityNameSelect.appendChild(option);
    });
}


activityNameSelect.addEventListener('change', (event) => {
    const index = event.target.value;

    if(!isOnEditMode)
        activityPriceInput.value = activitiesData[index].precioMensual;
    else
        activityPriceInput.value = activitiesPriceTemp[index];
});

activityPriceInput.addEventListener('input', (event) => {
    const newValue = checkNumberInput(event.target.value, 0);
    activityPriceInput.value = newValue;
    activitiesPriceTemp[activityNameSelect.value] = newValue;
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


let isOnEditMode = false;
function toggleEditMode() {
    isOnEditMode = !isOnEditMode
    if(isOnEditMode)
        enterEditMode();
    else
        exitEditMode();
}

function enterEditMode() {
    activitiesPriceTemp = activitiesData.map((activity) => activity.precioMensual);
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
    activityPriceInput.value = activitiesData[activityNameSelect.value].precioMensual;
}


async function saveData() {
    const [daysSuccess, daysMessage] = await saveDays();
    if(!daysSuccess) {
        ErrorMsg(daysMessage);
        return;
    }

    const [activitiesSuccess, activitiesMessage] = await saveActivities();
    if(!activitiesSuccess) {
        ErrorMsg(activitiesMessage);
        return;
    }

    SuccessMsg("¡Cambios realizados con éxito!");
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


async function saveActivities() {
    for (const [index, activity] of activitiesData.entries()) {
        if(activitiesPriceTemp[index] === activitiesData[index].precioMensual) continue;
        
        const [success, message] = await saveActivity(index);

        if(!success)
            return [success, message];
    };

    activitiesData.forEach((activity, index) => {
        activity.precioMensual = activitiesPriceTemp[index];
    });

    activitiesPriceTemp = null;

    return [true, ""]
}


async function saveActivity(index) {
    let newActivity = {
        id: activitiesData[index]._id,
        nombre: activitiesData[index].nombre,
        precioMensual: Number(activitiesPriceTemp[index]),
    };

    const activitiesRes = await fetch("/api/admin/actividad/change-price", {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(newActivity)
    });

    const activitiesResData = await activitiesRes.json();

    return [activitiesResData.success, activitiesResData.success ? "" : activitiesResData.message];
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