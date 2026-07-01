const ext = JSON.parse(parametersURL.get("external_reference"));
const container = document.querySelector(".main-container");

mostrarPago();

async function mostrarPago() {
    const res = await fetch(`/api/pago/get-pago/${ext.idPagoPendiente}`);
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