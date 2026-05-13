document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData);

    const birth = new Date(data.nacimiento)
    const dateNow = new Date(Date.now())

    if((dateNow.getFullYear() - birth.getFullYear()) < 14)
        return

    data.hipertension = !(data.hipertension === undefined)
    data.diabetes = !(data.diabetes === undefined)
    data.asma = !(data.asma === undefined)
    data.cardiacos = !(data.cardiacos === undefined)
    data.artitris = !(data.artitris === undefined)
    data.epilepsia = !(data.epilepsia === undefined)
    data.lesiones = !(data.lesiones === undefined);
    data.fuma = !(data.fuma === undefined)
    data.alcohol = !(data.alcohol === undefined)
    data.sintomasRecientes = !(data.sintomasRecientes === undefined)
    data.dificultadDormir = !(data.dificultadDormir === undefined)
    data.actividadFisica = !(data.actividadFisica === undefined)

    // autenticar?
    const res = await fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(data)
    })
})