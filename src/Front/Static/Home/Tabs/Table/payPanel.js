let clasesSeleccionadas = [];
let precioSeleccionado = 0;
let horarioSeleccionado = "";
let idClaseSeleccionada = "";
let fechaEspecífica;
let sessionData;

iniciar();

async function iniciar() {
    const res = await fetch("/session-data");
    sessionData = await res.json();
    console.log(sessionData);
    actualizarBotones();
}

function abrirPago(elemento) {
    const clase = elemento.dataset.clase;
    const precio = elemento.dataset.precio;
    const idClase = elemento.dataset.id;

    // Buscar horario desde la fila
    const fila = elemento.closest("tr");
    const horario = fila.querySelector("td").innerText;

    // Buscar fecha desde el header correspondiente
    const td = elemento.closest("td");

    const colIndex = td.cellIndex;

    const header = document.querySelectorAll(".slotHeader")[colIndex - 2];

    const fecha = header.dataset.fecha;
    /* console.log("Fecha encontrada: ");
    console.log(fecha); */

    claseSeleccionada = clase;
    precioSeleccionado = precio;
    horarioSeleccionado = horario;

    const [dia, mes, año] = fecha.split('/').map(Number);

    const horaInicio = horario.split('-')[0].trim();

    const [hora, minutos] = horaInicio.split(':').map(Number);

    const fechaBase = new Date(
        año,
        mes - 1,
        dia,
        hora,
        minutos
    );

    fechaBase.setSeconds(0, 0);

    conseguirClasesSeleccionadas(fechaBase, idClase);
    mostrarDatos(elemento, fechaBase, fecha, clase, precio, horario);
}

function mostrarDatos(elemento, fechaBase, fecha, clase, precio, horario) {

    const ahora = new Date();

    if (fechaBase < ahora) {

        document.getElementById("tituloClase").innerText = "Clase vencida";
        document.getElementById("precioClase").innerText = "-";
        document.getElementById("fechaClase").innerText = fecha;
        document.getElementById("salaClase").innerText = elemento.dataset.sala;
        document.getElementById("capacidad").innerText = elemento.dataset.capacidad

        document.getElementById("btnClaseUnica").hidden = true;
        document.getElementById("btnMensual").hidden = true;

        document.getElementById("panelPago").classList.add("panel-abierto");

        return;
    }

    document.getElementById("tituloClase").innerText = clase + " (" + horario + ")";
    document.getElementById("precioClase").innerText = "$" + precio;
    document.getElementById("fechaClase").innerText = fecha;
    document.getElementById("salaClase").innerText = elemento.dataset.sala;
    document.getElementById("panelPago").dataset.llena = elemento.dataset.llena;
    document.getElementById("capacidad").innerText = elemento.dataset.capacidad

    document.getElementById("panelPago").classList.add("panel-abierto");
}

function conseguirClasesSeleccionadas(fechaBase, idClase) {
    //Gracias chatgpt
    // Reinicio arreglo
    clasesSeleccionadas = [];

    // Agrego clase seleccionada + próximas 3 semanas
    for(let i = 0; i < 4; i++) {

        const nuevaFecha = new Date(fechaBase);
        /* console.log("Fecha base: ");
        console.log(nuevaFecha); */

        // suma 7 dias por iteración
        nuevaFecha.setDate(nuevaFecha.getDate() + (7 * i));

        clasesSeleccionadas.push({
            idClaseGeneral: idClase,
            fechaEspecifica: nuevaFecha
        });
    }
}

function mostrarOpcionesClaseUnica() {

    document.getElementById("btnMensual").hidden = true;
    document.getElementById("btnClaseUnica").hidden = true;

    document.getElementById("btnSeña").hidden = false;
    document.getElementById("btnCompleta").hidden = false;

    document.getElementById("btnVolver").hidden = false;
}

//Nuevo cerrar panel para resetear el estado a como estaba al inicio

function cerrarPanel() {

    document.getElementById("panelPago").classList.remove("panel-abierto");

    volverOpcionesPago();
}

function volverOpcionesPago() {

    document.getElementById("mensajePago").innerText = "";

    actualizarBotones();

    document.getElementById("btnSeña").hidden = true;
    document.getElementById("btnCompleta").hidden = true;
    document.getElementById("btnVolver").hidden = true;
}

function actualizarBotones() {
    const buttons = document.getElementsByClassName("paymentButtons");
    if(sessionData.logged && (sessionData.session.rol === "cliente")) {
        for(const button of buttons) {
            button.removeAttribute("hidden");
        }
    }
}

function pagarTotalidadClaseUnica() {
    pagar("unica", precioSeleccionado/4, [clasesSeleccionadas[0]]);
}

function pagarSeñaClaseUnica() {
    pagar("seña", (precioSeleccionado/4)/2, [clasesSeleccionadas[0]]);
}

function pagarMensual() {
    pagar("mensual", precioSeleccionado, clasesSeleccionadas);
}

async function abrirPanelAsistencia(){

    
    document.getElementById("qrModal").style.display = "flex";
    html5QrScanner = new Html5Qrcode("qr-reader");
    document.getElementById("cancelarLectura").addEventListener("click", async () => {
        await cerrarLectorQR();
    });

    html5QrScanner.start(
      { facingMode: "environment" }, //cámara trasera en celulares
      {
        fps: 10,
        qrbox: 250
      },
      async (decodedText) => {

        // detener cámara
        await cerrarLectorQR();

        document.getElementById("qrModal").style.display = "none";

        const res = await fetch("/api/asistencia/registrarQR", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            qr: decodedText
          })
        });

        const data = await res.json();
        
        alert(data.message || "Asistencia registrada correctamente");
        if (data.success){
            document.getElementById("assistanceModal").style.display = "none";
            console.log("La asistencia fue registrada y su data es: ");
            console.log(data.nueva);
        }

        //Este es del lado del cliente por lo que en caso de data.succeess
        //Supongo que con cerrar el pop-up para la cámara y mostrar un msg de exito basta.

      },
      (errorMessage) => {
        // ignorar errores de lectura
        console.log("Error de lectura: ");
        console.log(errorMessage);
      }
    );
}

async function cerrarLectorQR() {

    try {

        if (html5QrScanner) {
            await html5QrScanner.stop();
            await html5QrScanner.clear();
            html5QrScanner = null;
        }

    } catch(error) {
        console.error(error);
    }

    document.getElementById("qrModal").style.display = "none";
}

async function pagar(tipoClase, precio, clasesPago) {
    const nombre = document.getElementById("tituloClase").innerText;
    const fecha = document.getElementById("fechaClase").innerText;
    const sala = document.getElementById("salaClase").innerText;
    console.log("Este es el arreglo con las clases que se pagarán (desde payPanel): ")
    console.log(clasesPago);
    console.log(tipoClase);

    const res = await fetch('/api/pago/consultar-pago', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            clases: clasesPago
        })
    });

    const resData = await res.json();

    console.log("Desde consultar pago en pagar payPanel: ");
    console.log(resData);
    /* Ahora, resData recibe un arreglo de 4 objetos donde cada objeto tiene 2 elementos:
        1. .clase: (objeto) claseEspecifica o NULL (si la clase especifica no existe)
        2. .llena: (boolean) si la lista de anotados está llena o no.
    */

    
    /*
    Este es un ejemplo de lo que recibe resData
    Evidentemente, si se consulta por una clase única, datos solo recibe un elemento.
        
    Object
        datos: Array(4)
            0: {clase: {…}, llena: false}
            1: {clase: null, llena: false}
            2: {clase: null, llena: false}
            3: {clase: null, llena: false}
        length: 4
        success: true
    */

    if (!resData.success) {
        document.getElementById("mensajePago").innerText = resData.message;
        return;
    }

    // Clase llena -> confirmar lista espera
    /**
     * Revisar el tema de clase llena para los 4 días de la mensualidad:
     * 
     * Si solo una de las clases de la mensualidad está llena,
     * ¿Debería permitir anotarse en lista de espera?
     * 
     * Osea, si tengo la primer o tercer clase a la cual me quiero anotar mensualmente llena,
     * ¿debería permitir anotarse a la lista de espera de esa clase llena y el resto de clases anoto normalmente?
     * ¿o debería poner en espera en cada una de las 4 clases hasta que se pueda anotar a la que está llena?
     * ¿?
     */

    //consulta si alguna de las clases que se quieren reservar está llena.
    let hayLlena = false;
    let clasesLlenas = [];
    for(const act of resData.datos){
        if (act.llena){
            clasesLlenas.push(act.clase);
            hayLlena = true;
        }
    }

    if (hayLlena) {
        let mensajeLlena;
        //Si hay más de una clase llena, modifico el mensaje para
        if (clasesLlenas.length > 1){
            for(const act of clasesLlenas){
                
            }
        }
        else{

        }
        const confirmar = confirm(
            "La clase está llena. ¿Desea ingresar en lista de espera?"
        );

        if (!confirmar) {
            return;
        }
        else {
            //fetch a guardar en lista de espera
            const resEspera = await fetch('/api/clases/ingresarAEspera', {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    clases: clasesPago //resData.datos (contiene clasesEspecificas y si está llena o no)
                    //Acá puedo mandar las clases que recibo al consultar-pago (resData) así
                    //en el ingresarAEspera decido que hacer con todas las clases en las que esté llena la lista de anotados.
                })
            });

            const resEsperaData = await resEspera.json();

            document.getElementById("mensajePago").innerText = resEsperaData.message;
            return;
        }
    }

    document.getElementById("mensajePago").innerText = "";

    const resPref = await fetch('/api/pago/crear-preferencia', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            nombre: nombre,
            tipoClase: tipoClase, 
            precio: precio, 
            clases: clasesPago
        })
    });
    const resPreferencia = await resPref.json();
    window.open(resPreferencia.init_point, "_blank");
}