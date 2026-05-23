document.addEventListener("DOMContentLoaded", async () => {
    const navPlaceholder = document.getElementById("nav-placeholder");

    const sessionDataRes = await fetch("/session-data");
    const sessionData = await sessionDataRes.json();

    let route;

    if(!sessionData.logged)
        route = "/visitorNav";

    else {
        console.log(sessionData)
        switch(sessionData.session.rol) {
            case "cliente":
                route = window.location.pathname === "/"
                    ? "/userHomeNav"
                    : "/userNav";
                break;
            
            case "empleado":
                route = "/employeeNav";
                break;

            case "administrador":
                route = "/adminNav";
                break;

            default:
                route = "/visitorNav";
                break;
        }
    }

    const response = await fetch(route);
    const html = await response.text();

    navPlaceholder.innerHTML = html;
});