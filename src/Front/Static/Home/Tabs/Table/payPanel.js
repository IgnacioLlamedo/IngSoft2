
let claseSeleccionada = "";
let precioSeleccionado = 0;
let horarioSeleccionado = "";

console.log("Consiguiendo sessión data: ")
getSessionData();

async function getSessionData() {
    const sessionDataRes = await fetch("/session-data");
    const sessionData = await sessionDataRes.json();
    console.log(sessionData);

    if(sessionData.logged && (sessionData.session.rol === "cliente")) {
        console.log("La sesión fue iniciada: " + sessionData.logged)
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
    horarioSeleccionado = horario;

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
    pagar("unica", precioSeleccionado);
}

function pagarMensual() {
    // Ajustá la lógica de precio mensual según tu necesidad
    pagar("mensual", precioSeleccionado * 4);
}

async function pagar(tipo, precio) {
    const titulo = document.getElementById("tituloClase").innerText;
    const fecha = document.getElementById("fechaClase").innerText;
    const sala = document.getElementById("salaClase").innerText;
    const res = await fetch('/api/pago/crear-preferencia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            titulo: titulo,
            tipo: tipo, 
            cantidad:1, 
            precio: precio, 
            idClase: "un_id_de_clase", //Esto me está rompiendo la ejecución asi que lo hardcodee
            fechaEspecifica: fecha,
            sala: sala,
            horario: horarioSeleccionado
        })
    });

    const resData = await res.json();
    window.open(resData.init_point, "_blank");
}