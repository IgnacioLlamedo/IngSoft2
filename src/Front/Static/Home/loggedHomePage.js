const userIcon = document.getElementById("userIcon");
const userOptions = document.getElementById("userOptions");

const parametersURL = new URLSearchParams(window.location.search);
const statusPago = parametersURL.get('status');


if(statusPago == "approved") {
    alert("Pago aprobado.");
    
    const id_pago = parametersURL.get('payment_id')
    const ext = parametersURL.get('external_reference')
    const externo = JSON.parse(ext);
    
    console.log("Valores de retorno desde Mercado Pago: ");
    console.log(externo);
    
    const pagoData = {
        _id: id_pago,
        monto: externo.precio,
        idUsuario: externo.idUsuario,
        idClase: externo.idClase //Este id clase debe modificarse ->>> en payPanel (pagar debe recibirlo desde el slothClase)
    }
    
    guardarPago(pagoData);
}

async function guardarPago(data, ext) {
    const res = await fetch("/api/pago/guardarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(data)
    })

    const resData = await res.json();
    if(resData.success)
        guardarReserva(resData.data, ext);
}


async function guardarReserva(pagoData, ext) {
    if(ext.tipoClase === "unica"){
        const data  = {
            idClase: pagoData.idClase,
            pagos: [pagoData._id],
            señada: false,
            idUsuario: pagoData.idUsuario,
            cancelada: false,
            fechaEspecifica: ext.fechaEspecifica,
        };

        const res = await fetch("/api/clases/post-reserva-unica", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(data)
        })

        const resData = await res.json();
        if (resData.success){
            console.log("Reserva unica creada");
        }

        
    }

    else {
        const res = await fetch("/api/clases/post-reserva-mensual", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: data
        })
    }
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