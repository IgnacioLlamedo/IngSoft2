const userIcon = document.getElementById("userIcon");
const userOptions = document.getElementById("userOptions");


//Si la url de /home recibe status approved significa que volvió de la redirección de Mercado Pago
const parametersURL = new URLSearchParams(window.location.search);
const statusPago = parametersURL.get('status');
if(statusPago == "approved"){
    alert("Pago aprobado.");
    
    const id_pago = parametersURL.get('payment_id')
    const ext = parametersURL.get('external_reference')
    const externo = JSON.parse(ext);

    const pagoData = {
        _id: id_pago,           //abria que decidir si el id que se deja en base de datos es este o el automáticos
        monto: externo.monto,
        idUsuario: externo.idUsuario,
        idClase: externo.idClase
    }

    const pagoDataString = JSON.stringify(pagoData);
 
    guardarPago(pagoDataString)
}

async function guardarPago(data) {
    await fetch("/api/guardarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: data
    })
    const res = await res.json();
    window.location.href = res.redirect; //Redirige a tabMyActivities.html
}

userIcon.addEventListener("click", () => {
    userOptions.classList.toggle("user-options-open")
})

document.addEventListener("click", (e) => {
    if (!userIcon.contains(e.target) && !userOptions.contains(e.target))
        userOptions.classList.remove("user-options-open");
});

document.getElementById("logout").addEventListener("click", async (e) => {
    e.preventDefault();

    await fetch("/api/logout", {
        method: "POST"
    });

    window.location.href = "/";
});