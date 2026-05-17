const parameteresURL = new URLSearchParams(window.location.search);

const email = parametrosURL.get('mail');

document.getElementById("reenviar-codigo").addEventListener("click", async (event) => {
    const res = await fetch("/api/..", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: email
    });
});

document.getElementById("two-factor-authenticator-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const codigo = event.target.codigo.value;

    const data = {
        mail: email,
        codigo: codigo,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/authenticate", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: dataString
    });
});