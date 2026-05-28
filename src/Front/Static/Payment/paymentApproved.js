
const id_pago = parametersURL.get('payment_id');
const ext = parametersURL.get('external_reference')
const externo = JSON.parse(ext);
const container = document.querySelector(".main-container");


const pagoData = {
    idPagoPendiente: externo.idPagoPendiente
}

console.log("Pero la concha de mi madre. este es el pagoData recibido por external_reference en paymentApproved: ");
console.log(pagoData);

console.log("El importante es el id de pago pendiente: ")
console.log(pagoData.idPagoPendiente);

confirmarPago(pagoData, ext)


async function confirmarPago(data, ext) {
    console.log("Dentro de confirmarPago (paymentApproved.js.)");
    const res = await fetch("/api/pago/confirmarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        }, 
        body: JSON.stringify({
            idPagoPendiente: data.idPagoPendiente //Para que no rompa el json parser
        })
    });

    const resData = await res.json();
    if(resData.success){
        console.log("Me llegaron los datos del pago pendiente");
        //Ya llega hasta acá!
        console.log(resData.data);


        /** Devuelve un objeto pago con por ejemplo:
         * fecha: "2026-05-25T13:00:00.000Z"
         * idClase: "3"
         * idUsuario: "665d19bb-7eb8-44ea-8d53-efe9bcea09bd"
         * monto: 1
         * _id: "161257194162"    -->> id de pago.
         *
         * 
         * Habria que hacer otro fetch para traer el nombre de la clase usando idClaseGeneral -> idActividad
         * y traer el tipoClase usando idClaseGeneral precioMensual? (Si resData.data.monto === claseGeneral.precioMensual) -> "Mensual"
         * */

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


        //Una vez que se carga el HTML, se guarda la reserva y acá no se mandaría ext, se mandaría resData.data (osea el pago confirmado)
        //y la clase especifica conseguida para cargar el html(?
        await guardarReserva(resData.data, ext);
    }
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