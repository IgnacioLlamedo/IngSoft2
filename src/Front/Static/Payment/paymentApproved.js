
const id_pago = parametersURL.get('payment_id');
const ext = parametersURL.get('external_reference')
const externo = JSON.parse(ext);
const container = document.querySelector(".main-container");


const pagoData = {
    idPagoPendiente: externo.idPagoPendiente
}

console.log("pagoData recibido por external_reference en paymentApproved: ");
console.log(pagoData);

console.log("El importante es el id de pago pendiente: ")
console.log(pagoData.idPagoPendiente);

confirmarPago(pagoData, ext)


async function confirmarPago(data, ext) {
    console.log("Dentro de confirmarPago (paymentApproved.js.)");
<<<<<<< HEAD

=======
>>>>>>> siEstoNoFuncionaMeMato
    const res = await fetch("/api/pago/confirmarPago", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        }, 
        body: JSON.stringify({
<<<<<<< HEAD
            idPagoPendiente: data.idPagoPendiente, //Para que no rompa el json parser
        })
    });
//
    const resData = await res.json();
    if(resData.success){
        if (ext.idCupo){
            const resCupo = await fetch('/api/cupo/accept', {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idCupo: ext.idCupo })
            });
            const resDataCupo = await resCupo.json();
            console.log("El cupo fue aceptado con exito? --- respuesta: ", resDataCupo.success);
        }
=======
            idPagoPendiente: data.idPagoPendiente //Para que no rompa el json parser
        })
    });

    const resData = await res.json();
    if(resData.success){
>>>>>>> siEstoNoFuncionaMeMato
        /** 
         * resData.data devuelve un objeto pago con por ejemplo:
         * clases: [
                {
                    "idClase": "1",
                    "fecha": "2026-05-26T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd89"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-02T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8a"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-09T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8b"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-16T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8c"
                }
            ]
         * idUsuario: "665d19bb-7eb8-44ea-8d53-efe9bcea09bd"
         * monto: 4
         * pendiente: false
         * _id: "161257194162"    -->> id de pago.
         * */

        /**
         * 
         * idUsuario: req.session.user.id,
                    tipoClase: tipoClase,
                    nombre: nombre, //Nombre clase (yoga, spinning o funcional)
                    idPagoPendiente: pagoPendiente._id
         */

        const fechas = resData.data.clases.map(c => {
                const fecha = new Date(c.fecha);

                const dia = String(fecha.getDate()).padStart(2, '0');
                const mes = String(fecha.getMonth() + 1).padStart(2, '0');

                return `${dia}/${mes}`;
        }).join(" - ");

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
                        <strong>Fecha/s:</strong>
                        ${fechas}
                    </p>
                    <p>
                        <strong>Precio:</strong>
                        $${resData.data.monto}
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

    /** pagoData tiene esta información -->
         * clases: [
                {
                    "idClase": "1",
                    "fecha": "2026-05-26T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd89"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-02T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8a"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-09T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8b"
                },
                {
                    "idClase": "1",
                    "fecha": "2026-06-16T13:00:00.000Z",
                    "_id": "6a18641d792f32b71138fd8c"
                }
            ]

            extParsed tiene la siguiente información:

         *  idUsuario: req.session.user.id,
         *  tipoClase: tipoClase,
         *  nombre: nombre,
         *  idPagoPendiente: pagoPendiente._id

         **/

    const extParsed = JSON.parse(ext);

    if(extParsed.tipoClase === "mensual") { 
        console.log("hola soy guardar reserva Mensual");

        /* const data  = {
            idClase: pagoData.data.idClase, //Esto cambiarlo
            pagos: [{idPago: pagoData.data._id}],
            idUsuario: pagoData.data.idUsuario,
            fechaEspecifica: new Date(Date.now()), //Esto cambiarlo
        }; */

        const data = {
            clases: pagoData.clases, //Contiene la idClaseGeneral y FechasEspecificas
            pagos: [{ idPago: pagoData._id }],
            idUsuario: pagoData.idUsuario,
            tipoClase: "mensualidad"
        };
        console.log("Esta es la data que se mandará a post-reserva-mensual: ");
        console.log(data);

        const dataString = JSON.stringify(data);

        const res = await fetch("/api/clases/post-reserva-mensual", {
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: dataString
        })
    }
    else{
        let señada = false;
        if (extParsed.tipoClase == "seña"){
            console.log("Hola soy una seña de clase hecha reserva.")
            señada = true;
        }
        else
            console.log("Hola soy una reserva de clase única!!!");
        
        console.log(pagoData);
        
        const data  = {
            clases: pagoData.clases,
            pagos: [{idPago: pagoData._id}],
            señada: señada,
            idUsuario: pagoData.idUsuario,

            //No sé si hay que mandar algo más
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

    console.log("RESERVA COMPLETADA");
}