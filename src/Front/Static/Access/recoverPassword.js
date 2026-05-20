const verificationErrorMsg = document.getElementById("verificationError");

document.getElementById("recover-password-form").addEventListener("submit", async (event) => {

    event.preventDefault()

    const mail = event.target.mail.value

    const dataString = JSON.stringify({
        mail: mail
    })

    const res = await fetch("/api/resetpass", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: dataString
    });

    const resData = await res.json();

    if(resData.success) {
        console.log("La dirección conseguida de retorno es: " + resData.redirect);
        window.location.href = resData.redirect;
    }
    else 
    {
        verificationErrorMsg.textContent = resData.message;
        verificationErrorMsg.classList.remove("hidden");
    } 
})