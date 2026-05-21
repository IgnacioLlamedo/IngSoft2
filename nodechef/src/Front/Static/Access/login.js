const parametersURL = new URLSearchParams(window.location.search);

const email = parametersURL.get('mail');
const password = parametersURL.get('password'); // Cómo logeo sin pass? pasarla por url me parece una locura


const loginErrorMsg = document.getElementById("loginError");

document.getElementById("login-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;

    const userData = {
        mail: form.email.value,
        contraseña: form.contraseña.value,
    }

    
    const userDataString = JSON.stringify(userData);

    // autenticar req?
    const res = await fetch("/api/login", {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: userDataString
    });

    const resData = await res.json();

    if(resData.success)
        window.location.href = resData.redirect;
    else 
    {
        loginErrorMsg.textContent = resData.message;
        loginErrorMsg.classList.remove("hidden");
    } 
})
