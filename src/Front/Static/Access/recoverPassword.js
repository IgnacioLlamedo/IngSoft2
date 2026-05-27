const recoverErrorMsg = document.getElementById("recoverError");

document.getElementById("recover-password-form").addEventListener("submit", async (event) => {

    event.preventDefault()

    recoverErrorMsg.hidden = true;

    const email = event.target.email.value

    const dataString = JSON.stringify({
        mail: email
    })

    const res = await fetch("/api/recover-password", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: dataString
    });

    const resData = await res.json();

    if(resData.success)
        window.location.href = resData.redirect;
    else 
    {
        recoverErrorMsg.textContent = resData.message;
        recoverErrorMsg.hidden = false;
    } 
})