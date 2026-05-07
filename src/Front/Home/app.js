//Función que llamará a la creación de la preferencia de mercado pago.
/* async function pagar() {
  const res = await fetch("../controllers/crearPreferencia", { -> Eliminar
    method: "POST"
  });

  const data = await res.json();

  window.location.href = data.init_point;
} */

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

/*Cuando creen el frontend, el botón de pagár debe tener el atributo [onclick="pagar()"] para que al presionár el botón
Se llame a la función que redirigirá a mercado pago.*/ 

//<button onclick="pagar()">Comprar</button>
//<script src="app.js"></script>