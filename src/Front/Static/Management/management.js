const submitButton = document.getElementById("submit");
const successMsg = document.getElementById("editSuccess");
const errorMsg = document.getElementById("editError");

const daysInput = document.getElementById("days");


fetchData();
daysInput.disabled = true;



async function fetchData() {
    const daysRes = await fetch("/api/admin/diasaviso");
    const daysResData = await daysRes.json();

    daysInput.value = daysResData.data.diasAviso;
}


function checkNumberInput(value) {
    value = value.replace(/[^0-9]/g, "");

    if(value.charAt(0) === '0') value = "1";
    if(value.length > 2) value = value.slice(0, 2);

    daysInput.value = value;
}

daysInput.addEventListener('input', (event) => {
    event.preventDefault();
    checkNumberInput(event.target.value);
})


function checkNumberInputOnChange(value) {
    if(value.length === 0) value = "1";

    daysInput.value = value;
}

daysInput.addEventListener('change', (event) => {
    event.preventDefault();
    checkNumberInputOnChange(event.target.value);
})


submitButton.addEventListener("click", async (event) => {
    event.preventDefault();

    submitButton.classList.toggle("blue");

    if(submitButton.classList.contains("blue"))
        saveData(daysInput.value);
    else {
        daysInput.disabled = false;
        submitButton.textContent = "Guardar cambios"
    }
});

async function saveData(value) {
    daysInput.disabled = true;
    submitButton.textContent = "Editar"

    const data = {
        diasAviso: daysInput.value,
    }

    const dataString = JSON.stringify(data);

    const daysRes = await fetch("/api/admin/diasaviso", {
        method: 'PUT',
        headers: {
            "Content-Type" : "application/json",
        },
        body: dataString
    });

    const daysResData = await daysRes.json();

    if(daysResData.success)
        SuccessMsg(daysResData.message);
    else
        ErrorMsg(daysResData.message);
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