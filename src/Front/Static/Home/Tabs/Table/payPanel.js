
let claseSeleccionada = "";
let precioSeleccionado = 0;
let horarioSeleccionado = "";
let idClaseSeleccionada = "";
let fechaEspecífica;

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
    const idClase = elemento.dataset.id;

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
    idClaseSeleccionada = idClase;
    fechaEspecifica = convertirTextoADate(`${fecha} ${horario}`);

    document.getElementById("tituloClase").innerText = clase + " (" + horario + ")";
    document.getElementById("precioClase").innerText = "$" + precio;
    document.getElementById("fechaClase").innerText = fecha;
    document.getElementById("salaClase").innerText = elemento.dataset.sala;
    document.getElementById("capacidad").innerText = elemento.dataset.capacidad

    document.getElementById("panelPago").classList.add("panel-abierto");
}

function convertirTextoADate(texto) {

    const [fechaParte, horarioParte] = texto.split(' ');

    const [dia, mes] = fechaParte.split('/').map(Number);

    const horaInicio = horarioParte.split('-')[0].trim();

    const [hora, minutos] = horaInicio.split(':').map(Number);

    const año = new Date().getFullYear();

    const fecha = new Date(año, mes - 1, dia, hora, minutos);

    fecha.setSeconds(0, 0);

    return fecha;
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

async function pagar(tipoClase, precio) {
    const nombre = document.getElementById("tituloClase").innerText;
    const fecha = document.getElementById("fechaClase").innerText;
    const sala = document.getElementById("salaClase").innerText;
    
    //Modificando, antes de dejar pagar, hay que consultar si el usuario
    //ya está inscripto a la clase, despues dejar pagar. lpm
    const res = await fetch('/api/pago/consultar-pago', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            idClase: idClaseSeleccionada, //Revisar que sea la id correcta.
            fechaEspecifica: fechaEspecifica
        })
    });

    const resData = await res.json();
    if (resData.success) {
        const res = await fetch('/api/pago/crear-preferencia', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                nombre: nombre,
                tipoClase: tipoClase, 
                precio: precio, 
                idClase: idClaseSeleccionada, //Revisar que sea la id correcta.
                fechaEspecifica: fechaEspecifica
            })
        });
        const resPreferencia = await res.json();
        window.open(resPreferencia.init_point, "_blank");
        }
    else
        //Cambiar -> document.getElementById("").appendChild() crear texto bajo el botón
        window.alert(resData.message);
    
}