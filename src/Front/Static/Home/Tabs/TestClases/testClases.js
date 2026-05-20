

clases();
const main = document.querySelector("main");
let clasesData;

async function clases() {
    const res = await fetch("/api/clases/get-all", {
        method: 'GET'
    });

    const resData = await res.json();
    clasesData = resData.clases;
    console.log(resData);

    for(let clase of clasesData) {
        const div = document.createElement("div");
        const horario = document.createElement("p");
        const dia = document.createElement("p");
        const actividad = document.createElement("p");

        const buttonUnica = document.createElement("button");
        const buttonMes = document.createElement("button");

        buttonUnica.classList.add("buttonUnica");
        buttonUnica.addEventListener('click', async () => {
            /* const res = await fetch("/api/crear-preferencia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: clase.actividad.nombre, cantidad:1, monto: 1, id_Clase: clase.clase._id })
            });

            const resData = await res.json();
            console.log(resData);
            window.location.href = resData.init_point; */

            const res = await fetch("/api/guardarPago", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: clase.actividad.nombre, cantidad:1, monto: 1, id_Clase: clase.clase._id })
            });
        })

        /* buttonMes.classList.add("buttonMes");
        buttonMes.addEventListener('click', async () => {
            const res = await fetch("/api/crear-preferencia", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tipo: clase.actividad.nombre, cantidad:1, monto: 1, id_Clase: clase.clase._id })
            });

            const resData = await res.json();
            window.location.href = resData.init_point;
        }) */

        horario.textContent = clase.clase.hora;
        dia.textContent = clase.clase.dia;
        actividad.textContent = clase.actividad.nombre;

        buttonUnica.textContent = "Pagar unica";
        buttonMes.textContent = "Pagar mes";


        div.appendChild(actividad);
        div.appendChild(dia);
        dia.appendChild(horario);
        div.appendChild(buttonUnica);
        div.appendChild(buttonMes);
        main.appendChild(div);
    }
}



