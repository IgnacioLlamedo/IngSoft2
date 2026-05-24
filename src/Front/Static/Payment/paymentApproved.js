    
const id_pago = parametersURL.get('payment_id')
const ext = parametersURL.get('external_reference')
const externo = JSON.parse(ext);

console.log("Valores de retorno desde Mercado Pago: ");
console.log(externo);

const pagoData = {
    _id: id_pago,           //abria que decidir si el id que se deja en base de datos es este o el automáticos
    monto: externo.precio,
    idUsuario: externo.idUsuario,
    idClase: externo.idClase //Este id clase debe modificarse ->>> en payPanel (pagar debe recibirlo desde el slothClase)
}

const pagoDataString = JSON.stringify(pagoData);
console.log(pagoDataString);
//guardarPago(pagoDataString, ext)


async function guardarPago(data, ext) {
    const res = await fetch("/api/pago/guardarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: data
    })

    const resData = res.json();
    if(resData.success)
        guardarReserva(resData, ext);
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
            body: data
        })
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