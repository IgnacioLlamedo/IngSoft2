//Función que llamará a la creación de la preferencia de mercado pago.
async function pagar() {
  const res = await fetch("../controllers/crearPreferencia", {
    method: "POST"
  });

  const data = await res.json();

  window.location.href = data.init_point;
}

/*Cuando creen el frontend, el botón de pagár debe tener el atributo [onclick="pagar()"] para que al presionár el botón
Se llame a la función que redirigirá a mercado pago.*/ 