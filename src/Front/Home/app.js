//Función que llamará a la creación de la preferencia de mercado pago.

async function pagar(tipoClase, precio, cantidad) {

  const res = await fetch("/controllers/crearPreferencia", {
    method: "POST",

    headers: {
      "Content-Type": "application/json"
    },

    body: JSON.stringify({
      tipo: tipoClase,
      precio: precio,
      cantidad: cantidad
    })
  });

  const data = await res.json();

  window.location.href = data.init_point;
}