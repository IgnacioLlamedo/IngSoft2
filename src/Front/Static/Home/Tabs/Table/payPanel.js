let claseSeleccionada = "";
let precioSeleccionado = 0;

getSessionData();

async function getSessionData() {
    const sessionDataRes = await fetch("/session-data");
    const sessionData = await sessionDataRes.json();
    console.log(sessionData);

    if(sessionData.logged && (sessionData.session.rol === "cliente")) {
        const buttons = document.getElementsByClassName("paymentButtons");
        for(const button of buttons) {
            button.removeAttribute("hidden");
        }
    }
}


function abrirPago(elemento) {
    const clase = elemento.dataset.clase;
    const precio = elemento.dataset.precio;

    // Buscar horario desde la fila
    const fila = elemento.closest("tr");
    const horario = fila.querySelector("td").innerText;

    // Buscar fecha desde el header correspondiente
    const colIndex = elemento.closest("td").cellIndex;
    const header = document.querySelector(`#diasHeader th:nth-child(${colIndex+1})`);
    const fecha = header.dataset.fecha;

    claseSeleccionada = clase;
    precioSeleccionado = precio;

    document.getElementById("tituloClase").innerText = clase + " (" + horario + ")";
    document.getElementById("precioClase").innerText = "$" + precio;
    document.getElementById("fechaClase").innerText = fecha;
    document.getElementById("salaClase").innerText = elemento.dataset.sala;

    document.getElementById("panelPago").classList.add("panel-abierto");
}



function cerrarPanel() {
    document.getElementById("panelPago").classList.remove("panel-abierto");
}

function pagarClaseUnica() {
    pagar(claseSeleccionada, precioSeleccionado);
}

function pagarMensual() {
    // Ajustá la lógica de precio mensual según tu necesidad
    pagar(claseSeleccionada, precioSeleccionado * 4);
}

async function pagar(tipoClase, precio) {
    const res = await fetch("/api/crear-preferencia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo: tipoClase, cantidad:1, precio: precio })
    });

    const resData = await res.json();
    window.location.href = resData.init_point;
}