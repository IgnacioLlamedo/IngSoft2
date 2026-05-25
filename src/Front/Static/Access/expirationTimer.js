const parametersURL = new URLSearchParams(window.location.search);
const emailParameter = parametersURL.get('email');
const verificationErrorMsgFirstCode = document.getElementById("authenticationError");

sendCode();

async function sendCode() {
    if(!emailParameter) return;

    const res = await fetch("/api/generate-code", {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({mail: emailParameter})
    });

    const resData = await res.json();

    if(resData.success)
        createTimer(resData.expirationTime);
    else 
    {
        verificationErrorMsgFirstCode.textContent = resData.message;
        verificationErrorMsgFirstCode.removeAttribute("hidden");
    }
}

let timer;
const timerElem = document.getElementById("timer");
let timerValue = "00:00"

function createTimer(timeMS) {
    let seconds = timeMS / 1000;
    let minutes = Math.floor(timeMS / 1000 / 60);

    changeTime(minutes, seconds);

    timer = setInterval(() => {
        seconds--;

        if(seconds <= 0) {
            if(minutes >= 1) {
                seconds = 60;
                minutes--;
            }

            else {
                clearInterval(timer);
                timerElem.classList.add("errorMsgJustRed");
            }
        }

        changeTime(minutes, seconds);
    }, 1000);
}

function changeTime(minutes, seconds) {
    timerValue = `Tiempo restante para validar el código: ${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    timerElem.textContent = timerValue;
}


document.getElementById("reenviar-codigo").addEventListener("click", async (event) => {
    resendCode();
});

function resendCode() {
    timerElem.textContent = `Tiempo restante para validar el código: Enviando nuevo código...`;
    timerElem.classList.remove("errorMsgJustRed");
    clearInterval(timer);
    sendCode();
}
