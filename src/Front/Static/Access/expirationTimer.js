const paramsURL = new URLSearchParams(window.location.search);
const emailParameter = paramsURL.get('email');
const verificationErrorMsgFirstCode = document.getElementById("authenticationError");

class Timer {
    #timer;
    #remainingTimeFormatted = (minutes, seconds) => `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    constructor(timeMS, {onChange, onFinish}) {
        this.timeMS = timeMS;
        this.onChange = onChange;
        this.onFinish = onFinish;
    }

    createTimer() {
        let totalSeconds = Math.floor(this.timeMS / 1000);

        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;

        this.onChange(this.#remainingTimeFormatted(minutes, seconds));

        this.#timer = setInterval(() => {
            seconds--;

            if(seconds <= 0) {
                if(minutes >= 1) {
                    seconds = 60;
                    minutes--;
                }

                else {
                    clearInterval(this.#timer);
                    this.onFinish();
                }
            }

            this.onChange(this.#remainingTimeFormatted(minutes, seconds));

        }, 1000);
    }

    stopTimer() {
        clearInterval(this.#timer);
    }
}



const expirationTimerElement = document.getElementById("timer");

const resendTimerElement = document.getElementById("reenviar-codigo");
const resendCooldownMS = 15000; // 15s

let resendTimer = new Timer(
    resendCooldownMS,
    {
        onChange: (remainingTime) => {
            resendTimerElement.textContent = `Enviar código otra vez en: ${remainingTime}`
        },

        onFinish: () => {
            resendTimerElement.textContent = "Enviar código otra vez";
            resendTimerElement.classList.remove("disabled-anchor");
        }
    }
);








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

    if(resData.success) {
        createExpirationTimer(resData.expirationTime);
        resendTimer.createTimer();
    }
    else 
    {
        verificationErrorMsgFirstCode.textContent = resData.message;
        verificationErrorMsgFirstCode.removeAttribute("hidden");
    }
}



let expirationTimer = null;
function createExpirationTimer(timeMS) {
    if(!expirationTimer) {
        expirationTimer = new Timer(
            timeMS,
            {
                onChange: (remainingTime) => {
                    expirationTimerElement.textContent = `Tiempo restante para validar el código: ${remainingTime}`
                },

                onFinish: () => {
                    expirationTimerElement.classList.add("errorMsgJustRed");
                }
            }
        );
    }

    expirationTimer.createTimer();
}


resendTimerElement.addEventListener("click", async (event) => {
    resendCode();
});


function resendCode() {
    resendTimerElement.classList.add("disabled-anchor");
    resendTimerElement.textContent = "Enviar código otra vez: --:--";

    expirationTimer.stopTimer();
    expirationTimerElement.textContent = `Tiempo restante para validar el código: Enviando nuevo código...`;
    expirationTimerElement.classList.remove("errorMsgJustRed");

    sendCode();
}








