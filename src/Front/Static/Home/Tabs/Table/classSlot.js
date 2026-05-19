document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.slotDeClase').forEach(div => {
        const texto = div.innerText.trim();

        switch(texto) {
        case "Spinning":
            div.classList.add("spinning");
            div.dataset.clase = "Spinning";
            div.dataset.precio = "3500";
            div.onclick = () => abrirPago(div);
            break;
        case "Yoga":
            div.classList.add("yoga");
            div.dataset.clase = "Yoga";
            div.dataset.precio = "2500";
            div.onclick = () => abrirPago(div); 
            break;
        case "Funcional":
            div.classList.add("funcional");
            div.dataset.clase = "Funcional";
            div.dataset.precio = "3000";
            div.onclick = () => abrirPago(div);
            break;
        case "Sin Clase":
            div.classList.add("sinclase");
            break;
        default:
            div.classList.add("otro");
            break;
        }

    });
});