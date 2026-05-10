import { usuarioDao } from "/";

document.getElementById("register-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log(event);


    usuarioDao.create({nombre: "a"})
    
    
})