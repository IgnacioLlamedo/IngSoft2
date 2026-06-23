const userIcon = document.getElementById("userIcon");
const userOptions = document.getElementById("userOptions");

/* const parametersURL = new URLSearchParams(window.location.search);
const statusPago = parametersURL.get('status');


if(statusPago == "approved") {
    
    const id_pago = parametersURL.get('payment_id')
    const ext = parametersURL.get('external_reference')
    const externo = JSON.parse(ext);

    
    const pagoData = {
        _id: id_pago,
        monto: externo.precio,
        idUsuario: externo.idUsuario,
        idClase: externo.idClase, //Este id clase debe modificarse ->>> en payPanel (pagar debe recibirlo desde el slothClase)
        fecha: externo.fechaEspecifica
    }
    
    guardarPago(pagoData, externo);
}

async function guardarPago(data, ext) {
    const res = await fetch("/api/guardarPago", {
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
    const data  = {
            idClase: pagoData.idClase,
            señada: false,
            idUsuario: pagoData.idUsuario,
            cancelada: false,
            fechaEspecifica: ext.fechaEspecifica,
    };
    
    console.log("El id de clase general obtenido en front es: ");
    console.log (data.idClase);

    if(ext.tipoClase === "unica"){
        data.idPago = pagoData._id;

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
        //Ver como modificar, creo que habria que enviar solo el objeto, sin el array
        data.pagos = [ { idPago: pagoData._id } ];
        const res = await fetch("/api/clases/post-reserva-mensual", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(data)
        })

        const resData = await res.json();
        console.log("Al volver de post-reserva-mensual el resultado es: ")
        console.log(resData); 
        if (resData.success){
            console.log("Reserva mensual exitosa");
        }
    }
} */



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