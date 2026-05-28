
let clasesSeleccionadas = [];
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
    const fechaBase = convertirTextoADate(`${fecha} ${horario}`);

    console.log("Esta es la fecha base para crear las fechasEspecificas: ");
    console.log(fechaBase);

    //Gracias chatgpt
    // Reinicio arreglo
    clasesSeleccionadas = [];

    // Agrego clase seleccionada + próximas 3 semanas
    for(let i = 0; i < 4; i++) {

        const nuevaFecha = new Date(fechaBase);

        // suma 7 dias por iteración
        nuevaFecha.setDate(nuevaFecha.getDate() + (7 * i));
        console.log("Esta es la nueva fecha que se va a guardar desde payPanel: ");
        console.log(nuevaFecha);

        clasesSeleccionadas.push({
            idClaseGeneral: idClase,
            fechaEspecifica: nuevaFecha
        });
    }

    console.log(clasesSeleccionadas);

    document.getElementById("tituloClase").innerText = clase + " (" + horario + ")";
    document.getElementById("precioClase").innerText = "$" + precio;
    document.getElementById("fechaClase").innerText = fecha;
    document.getElementById("salaClase").innerText = elemento.dataset.sala;
    document.getElementById("panelPago").dataset.llena = elemento.dataset.llena;
    document.getElementById("capacidad").innerText = elemento.dataset.capacidad

    document.getElementById("panelPago").classList.add("panel-abierto");
}

function mostrarOpcionesClaseUnica() {

    document.getElementById("btnMensual").hidden = true;
    document.getElementById("btnClaseUnica").hidden = true;

    document.getElementById("btnSeña").hidden = false;
    document.getElementById("btnCompleta").hidden = false;

    document.getElementById("btnVolver").hidden = false;
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
/* 
function cerrarPanel() {
    document.getElementById("panelPago").classList.remove("panel-abierto");
} */

//Nuevo cerrar panel para resetear el estado a como estaba al inicio

function cerrarPanel() {

    document.getElementById("panelPago").classList.remove("panel-abierto");

    volverOpcionesPago();
}

function volverOpcionesPago() {

    document.getElementById("mensajePago").innerText = "";

    document.getElementById("btnClaseUnica").hidden = false;
    document.getElementById("btnMensual").hidden = false;

    document.getElementById("btnSeña").hidden = true;
    document.getElementById("btnCompleta").hidden = true;
    document.getElementById("btnVolver").hidden = true;
}

function pagarTotalidadClaseUnica() {
    pagar("unica", precioSeleccionado/4, [clasesSeleccionadas[0]]);
}

function pagarSeñaClaseUnica() {
    pagar("seña", (precioSeleccionado/4)/2, [clasesSeleccionadas[0]]);
}

function pagarMensual() {
    // Ajustá la lógica de precio mensual según tu necesidad
    pagar("mensual", precioSeleccionado, clasesSeleccionadas); //Mando el arreglo con las 4 id y fechas especificas
}

async function pagar(tipoClase, precio, clasesPago) {
    const nombre = document.getElementById("tituloClase").innerText;
    const fecha = document.getElementById("fechaClase").innerText;
    const sala = document.getElementById("salaClase").innerText;
    const claseLlena = document.getElementById("panelPago").dataset.llena === "true";
    
    //Modificando, antes de dejar pagar, hay que consultar si el usuario
    //ya está inscripto a la clase, despues dejar pagar. lpm
    const res = await fetch('/api/pago/consultar-pago', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            clases: clasesPago// --->>> Acá en caso de que sea Mensual, manda un arreglo con 4 ids y Fechas especificas
        })                             //Y si es pago de seña o unica completa, se manda un objeto con idClase y FechaEspecifica
    });

    const resData = await res.json();

    if (!resData.success) {
        document.getElementById("mensajePago").innerText = resData.message;
        return;
    }

    // Clase llena -> confirmar lista espera
    let ingresarEspera = false;

    if (claseLlena) {

        const confirmar = confirm(
            "La clase está llena. ¿Desea ingresar en lista de espera?"
        );

        if (!confirmar) {
            return;
        }

        ingresarEspera = true;
    }

    document.getElementById("mensajePago").innerText = "";
    document.getElementById("mensajePago").innerText = "";

    const resPref = await fetch('/api/pago/crear-preferencia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            nombre: nombre,
            tipoClase: tipoClase, 
            precio: precio, 
            clases: clasesPago// -->> Acá en caso de que sea Mensual, manda un arreglo con 4 ids y Fechas especificas
        })                          //Y si es pago de seña o unica completa, se manda un objeto con idClase y FechaEspecifica
    });
    const resPreferencia = await resPref.json();
    window.open(resPreferencia.init_point, "_blank");
}