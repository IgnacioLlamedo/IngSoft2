const ext = JSON.parse(parametersURL.get("external_reference"));
const container = document.querySelector(".main-container");

<<<<<<< HEAD
console.log("Estos son los datos que llegaron en la URL desde paymentApproved.js: ");
console.log(externo);

const pagoData = {
    idPagoPendiente: externo.idPagoPendiente,
    fechaPago: externo.fechaPago
}
=======
mostrarPago();

async function mostrarPago() {
>>>>>>> origin/Front-Facu-x-siEstoNoFuncionaMeMato

    const res = await fetch(`/api/pago/get-pago/${ext.idPagoPendiente}`);

<<<<<<< HEAD
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
            idPagoPendiente: data.idPagoPendiente, //Para que no rompa el json parser
            fechaPago: data.fechaPago
        })
    });
//
=======
>>>>>>> origin/Front-Facu-x-siEstoNoFuncionaMeMato
    const resData = await res.json();

    if (!resData.success) {

        container.innerHTML = `
            <h2>No se pudo recuperar la información del pago.</h2>
        `;

        return;
    }

    const pago = resData.data;

    const fechas = pago.clases
        .map(c => {

            const fecha = new Date(c.fecha);

            return `${String(fecha.getDate()).padStart(2,'0')}/${String(fecha.getMonth()+1).padStart(2,'0')}`;

        })
        .join(" - ");

    container.innerHTML = `
        <div class="payment-success">

            <div class="payment-info">

                <p><strong>Clase:</strong> ${ext.nombre}</p>

                <p><strong>Tipo:</strong> ${ext.tipoClase}</p>

                <p><strong>Fecha/s:</strong> ${fechas}</p>

                <p><strong>Precio:</strong> $${pago.monto}</p>

                ${
                    ext.tipoClase === "seña"
                    ? `
                    <div class="mensaje-seña">
                        Recuerde que para acceder a la clase debe completar el pago desde
                        <strong>Mis actividades → Pagar restante</strong>.
                    </div>
                    `
                    : ""
                }

            </div>

        </div>
    `;
}