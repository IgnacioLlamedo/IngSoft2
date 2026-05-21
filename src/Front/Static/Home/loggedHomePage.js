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
        idClase: externo.idClase, //Este id clase debe modificarse ->>> en payPanel (pagar debe recibirlo desde el slothClase)
        fecha: externo.fechaEspecifica
    }
    
    guardarPago(pagoData, externo);
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
    console.log("El guardado del pago en DB fue " + resData.success);
    console.log(resData);
    if(resData.success)
        guardarReserva(resData.data, ext);
}


async function guardarReserva(pagoData, ext) {

    if(ext.tipoClase === "unica"){
        const data  = {
            /*ValidationError: ReservaUnica validation failed: idUsuario: Path `idUsuario` is required., idClase: Path `idClase` is required.
    at model.validate (/opt/render/project/src/node_modules/mongoose/lib/document.js:2864:36)
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async model.$__save (/opt/render/project/src/node_modules/mongoose/lib/model.js:393:7)
    at async model.save (/opt/render/project/src/node_modules/mongoose/lib/model.js:667:5)
Menu
    at async model.create (/opt/render/project/src/node_modules/mongoose/lib/model.js:2747:5)
    at async reservaDao.createUnica (file:///opt/render/project/src/src/daos/reserva.dao.js:5:16)
    at async postReservaUnica (file:///opt/render/project/src/src/controllers/clases.controller.js:50:9) {
  errors: {
    idUsuario: ValidatorError: Path `idUsuario` is required.
        at SchemaString.doValidate (/opt/render/project/src/node_modules/mongoose/lib/schemaType.js:1517:13)
        at model.validate (/opt/render/project/src/node_modules/mongoose/lib/document.js:2842:20)
        at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
        at async model.$__save (/opt/render/project/src/node_modules/mongoose/lib/model.js:393:7)
        at async model.save (/opt/render/project/src/node_modules/mongoose/lib/model.js:667:5)
        at async model.create (/opt/render/project/src/node_modules/mongoose/lib/model.js:2747:5)
        at async reservaDao.createUnica (file:///opt/render/project/src/src/daos/reserva.dao.js:5:16)
        at async postReservaUnica (file:///opt/render/project/src/src/controllers/clases.controller.js:50:9) {
      properties: [Object],
      kind: 'required',
      path: 'idUsuario',
      value: undefined,
      reason: undefined,
      Symbol(mongoose#validatorError): true
    },
    idClase: ValidatorError: Path `idClase` is required.
        at SchemaString.doValidate (/opt/render/project/src/node_modules/mongoose/lib/schemaType.js:1517:13)
        at model.validate (/opt/render/project/src/node_modules/mongoose/lib/document.js:2842:20)
        at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
        at async model.$__save (/opt/render/project/src/node_modules/mongoose/lib/model.js:393:7)
        at async model.save (/opt/render/project/src/node_modules/mongoose/lib/model.js:667:5)
        at async model.create (/opt/render/project/src/node_modules/mongoose/lib/model.js:2747:5)
        at async reservaDao.createUnica (file:///opt/render/project/src/src/daos/reserva.dao.js:5:16)
        at async postReservaUnica (file:///opt/render/project/src/src/controllers/clases.controller.js:50:9) {
      properties: [Object],
      kind: 'required',
      path: 'idClase',
      value: undefined,
      reason: undefined,
      Symbol(mongoose#validatorError): true
    }
  },
  _message: 'ReservaUnica validation failed'
}    */
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
        console.log("Al volver de post-reserva-unica el resultado es: ")
        console.log(resData);
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