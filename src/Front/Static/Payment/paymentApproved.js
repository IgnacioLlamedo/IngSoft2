
const id_pago = parametersURL.get('payment_id')
console.log("El id de pago que está en la URL es: " + id_pago);
const ext = parametersURL.get('external_reference')
const externo = JSON.parse(ext);
const container = document.querySelector(".main-container");

container.innerHTML =
`<div class="payment-success">

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

            ${
            externo.tipoClase === "seña"
            ?
            `
            <div class="mensaje-seña">
                Recuerde que para acceder a la clase debe completar el pago desde la pestaña 
                <strong>Mis actividades → Pagar restante</strong>.
            </div>
            `
            :
            ""
        }

        </div>
</div>`;


const pagoData = {
    _id: id_pago,
    monto: externo.precio,
    idUsuario: externo.idUsuario,
    idClase: externo.idClase,
    fecha: externo.fechaEspecifica
}

const pagoDataString = JSON.stringify(pagoData);
guardarPago(pagoDataString, ext)


async function guardarPago(data, ext) {
    console.log("Dentro de guardarPago (paymentApproved.js.)");
    const res = await fetch("/api/pago/guardarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        }, 
        body: data
    })

    const resData = await res.json();
    if(true)//resData.success)
        await guardarReserva(resData, ext);
}


async function guardarReserva(pagoData, ext) {

    const extParsed = JSON.parse(ext);

    if ((extParsed.tipoClase == "unica") || (extParsed.tipoClase == "seña")) {

        let señada = false;
        if (extParsed.tipoClase == "seña"){
            señada = true;

        }
        const data  = {
            idClase: pagoData.data.idClase,
            pagos: [{idPago: pagoData.data._id}],
            señada: señada,
            idUsuario: pagoData.data.idUsuario,
            fechaEspecifica: extParsed.fechaEspecifica
        };

        /* console.log("Estos son los datos que se usarán para cargar la clase especifica y para crear la reserva: ");
        console.log(data) */

        const dataString = JSON.stringify(data);

        const res = await fetch("/api/clases/post-reserva-unica", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: dataString
        })

        const resData = await res.json();
        console.log("Volviendo a paymentApproved desde postReservaUnica, el resultado fue "+resData.success);
        console.log(resData.message);
    }

    else if(extParsed.tipoClase === "mensual") {
        console.log("hola soy guardar reserva UNICA");

        const data  = {
            idClase: pagoData.data.idClase,
            pagos: [{idPago: pagoData.data._id}],
            idUsuario: pagoData.data.idUsuario,
            fechaEspecifica: new Date(Date.now()), //Esto cambiarlo
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