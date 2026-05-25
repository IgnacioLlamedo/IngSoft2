const parametrosURL = new URLSearchParams(window.location.search);
const authenticationErrorMsg = document.getElementById("authenticationError");

const email = parametrosURL.get('email');

document.getElementById("two-factor-authenticator-form").addEventListener("submit", async (event) => {
    
    event.preventDefault();

    const codigo = event.target.codigo.value;

    const data = {
        mail: email,
        codigo: codigo,
    }

    const dataString = JSON.stringify(data);

    const res = await fetch("/api/authPass", {
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
        authenticationError.textContent = resData.message;
        authenticationError.removeAttribute("hidden");
    } 
});