import { Router } from "express";
import { usuarioDao } from "../../daos/usuario.dao.js";
import { homeRoutes } from "../../app.js";

const router = Router();
const dao = new usuarioDao();

router.post("/login", async (req, res) => {

    try {
        const mail = req.body.mail;
        const password = req.body.contraseña;

        const user = await dao.readOne(mail);

        // usuario no encontrado
        if(!user) {
            return res.json({
                success: false,
                message: "Error al Iniciar Sesión en la cuenta. El email ingresado no está registrado."
            });
        }

        // Contraseña incorrecta
        if(user.contraseña !== password) {
            return res.json({
                success: false,
                message: "Error al Iniciar Sesión en la cuenta. La contraseña ingresada es incorrecta."
            });
        }

        //guardo la sesión del usuario
        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
        };

        //Se decide desde que vista se iniciará sesión.
        let redirect = homeRoutes[user.rol];

        res.json({
            success: true,
            redirect
        });

    } catch(error){

        console.log("Error al iniciar sesión:");
        console.error(error);

        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
});


router.post("/logout", async (req, res) => {
    req.session.destroy(() => {
        //res.clearCookie("connect.sid");

        res.json({
            success: true
        });
    });
});

export default router;