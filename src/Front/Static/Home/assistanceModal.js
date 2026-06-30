const assistanceModal = document.getElementById("assistanceModal");
const closeAssistance = document.getElementById("closeAssistance");
let qrScanner = null;

const btnEscanearQR = document.getElementById("btnEscanearQR");
const btnCancelarQR = document.getElementById("btnCancelarQR");
const qrReaderContainer = document.getElementById("qrReaderContainer");
const mensajeAsistencia = document.getElementById("mensajeAsistencia");


//Muestra el modal para leer el qr y enciende la cámara trasera(en teoría)
btnEscanearQR.addEventListener("click", async () => {
  btnEscanearQR.hidden = true;
  btnCancelarQR.hidden = false;
  qrReaderContainer.hidden = false;

  qrScanner = new Html5Qrcode("qr-reader");

  await qrScanner.start(
    { facingMode: "environment" }, //Revisar si esto utiliza la camara trasera
    {
      fps: 10,
      qrbox: 250
    },
    async (decodedText) => {
      try {
        console.log("Este es el codigo descodificado del QR.")
        console.log(decodedText);

        await qrScanner.stop();
        await qrScanner.clear();

        const res = await fetch("/api/asistencia/asistenciaQR", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify({token: decodedText})
        });

        const data = await res.json();

        console.log(data);

        mensajeAsistencia.innerText = data.message || "Asistencia registrada";

        qrReaderContainer.hidden = true;
        btnEscanearQR.hidden = false;
      } catch(error) {
        console.error(error);
      }
  });
});

//cancela la lectura de qr
btnCancelarQR.addEventListener("click", async () => {
  if (qrScanner) {
    try{
      await qrScanner.stop();
      await qrScanner.clear();
    }
    catch(error) {
      console.error(error);
    }
  }

  qrReaderContainer.hidden = true;
  btnEscanearQR.hidden = false;
});

//Para cerrar el modal de lectura de QR
closeAssistance.addEventListener("click", async () => {
  assistanceModal.style.display = "none";
  if((qrScanner) && qrScanner.getState()) { //por si no cancela con el botón primero
    try{
      await qrScanner.stop();
      await qrScanner.clear();
    } catch(error) {
      console.error(error);
    }
  }

  qrReaderContainer.hidden = true;
  btnEscanearQR.hidden = false;
  btnCancelarQR.hidden = true;
});

// engancha todos los botones con clase .asistenciaBtn
document.querySelectorAll(".asistenciaBtn").forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    assistanceModal.style.display = "flex"; // abrir modal
  });
});

if (closeAssistance) {
  closeAssistance.addEventListener("click", () => {
    assistanceModal.style.display = "none"; // cerrar modal
  });
}

window.addEventListener("click", (e) => {
  if (e.target === assistanceModal) {
    assistanceModal.style.display = "none";
  }
});
