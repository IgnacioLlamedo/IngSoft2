const parametrosURL = new URLSearchParams(window.location.search);
const authenticationErrorMsg = document.getElementById("authenticationError");

const email = parametrosURL.get('email');



document.getElementById("authenticator-form").addEventListener("submit", async (event) => {
    console.log("DEBUG: (entrando desde authenticator-form en authentication.js) Enviando codigo");
    event.preventDefault();

    authenticationErrorMsg.hidden = true;

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
    console.log(resData);

    if(resData.success)
        window.location.href = resData.redirect;
    else 
    {
        authenticationErrorMsg.textContent = resData.message;
        authenticationErrorMsg.hidden = false;
    }
});