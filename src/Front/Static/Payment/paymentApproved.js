    
const id_pago = parametersURL.get('payment_id')
const ext = parametersURL.get('external_reference')
const externo = JSON.parse(ext);
const container = document.querySelector(".main-container");

container.innerHTML =
`<div class="payment-success">

        <div class="check-container">
            ✔️
        </div>

        <div class="payment-info">
            <p>
                <strong>Clase:</strong>
                ${externo.nombre}
            </p>
            <p>
                <strong>Tipo:</strong>
                ${externo.tipoClase}
            </p>
            <p>
                <strong>Fecha:</strong>
                ${externo.fechaEspecifica}
            </p>
            <p>
                <strong>Precio:</strong>
                $${externo.precio}
            </p>
        </div>
    </div>`;

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
guardarPago(pagoDataString, ext)


async function guardarPago(data, ext) {
    const res = await fetch("/api/pago/guardarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: data
    })

    const resData = await res.json();
    console.log("hola soy guardarPAgo este es mi res: ");
    console.log(resData);
    if(true)//resData.success)
        await guardarReserva(resData, ext);
}


async function guardarReserva(pagoData, ext) {
    console.log("hola soy guardar reserva");

    console.log("SOY PAGO DATA PRE PARSE");
    console.log(typeof(pagoData));
    console.log(pagoData);

    const extParsed = JSON.parse(ext);

    console.log("EXTERNOS PARSEADOS:");
    console.log(extParsed);

    if(extParsed.tipoClase == "unica") {
        console.log("hola soy guardar reserva UNICA");

        const data  = {
            idClase: pagoData.data.idClase,
            pagos: [{idPago: pagoData.data._id}],
            señada: false,
            idUsuario: pagoData.data.idUsuario,
            fechaEspecifica: new Date(Date.now()),
        };

        const dataString = JSON.stringify(data);

        const res = await fetch("/api/clases/post-reserva-unica", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: dataString
        })
    }

    else if(extParsed.tipoClase === "mensual") {
        console.log("hola soy guardar reserva UNICA");

        const data  = {
            idClase: pagoData.data.idClase,
            pagos: [{idPago: pagoData.data._id}],
            idUsuario: pagoData.data.idUsuario,
            fechaEspecifica: new Date(Date.now()),
        };

        const dataString = JSON.stringify(data);

        const res = await fetch("/api/clases/post-reserva-mensual", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: dataString
        })
    }
    console.log("TERMINEE FOTROO LA RESERVA DE MIERDA");
}