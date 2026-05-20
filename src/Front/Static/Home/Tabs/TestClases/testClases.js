

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



