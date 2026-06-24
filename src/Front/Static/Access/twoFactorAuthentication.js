const parametrosURL = new URLSearchParams(window.location.search);
const verificationErrorMsg = document.getElementById("verificationError");

const email = parametrosURL.get('email');


// Al parecer sta página no se está usando, en su lugar...
// existe authentication.js que posee la misma lógica.
// Pero por las dudas no la borro :v
document.getElementById("reenviar-codigo").addEventListener("click", async (event) => {
    console.log("DEBUG: (entrando desde reenviar-codigo) Reenviando codigo");
    const res = await fetch("/api/authentication", {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({mail: email})
    });
});

document.getElementById("two-factor-authenticator-form").addEventListener("submit", async (event) => {
    console.log("DEBUG: (entrando desde two-factor-authenticator-form) Enviando codigo");
    event.preventDefault();

    verificationErrorMsg.hidden = true;

    const codigo = event.target.codigo.value;

    const data = {
        mail: email,
        codigo: codigo,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/authentication", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: dataString
    });
    const resData = await res.json();

    console.log("Los datos recibidos en tFA.js son: ");
    console.log(resData.success);
    console.log(resData.redirect);

    if(resData.success) {
        console.log("La dirección conseguida de retorno es: " + resData.redirect);
        window.location.href = resData.redirect;
    }
    else 
    {
        verificationErrorMsg.textContent = resData.message;
        verificationErrorMsg.hidden = false;
    }
});