const parametrosURL = new URLSearchParams(window.location.search);

const email = parametrosURL.get('email');

//asi seria el fetch
/* const res = await fetch("/api/resetpass", {
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({mail: email})
    }); */
