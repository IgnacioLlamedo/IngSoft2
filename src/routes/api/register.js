import { Router } from "express";
import { usuarioDao } from "../../daos/usuario.dao.js";

const router = Router();
const dao = new usuarioDao();


const errorMessages = {
    11000: "Error al crear la cuenta, el email ya está registrado.",
};


router.post("/register", async (req, res) => {
    try {
        await dao.create(req.body);

        res.json({
            success: true
        });
    }
    catch(error) {
        res.json({
            success: false,
            message: errorMessages[error.code] || "Error al crear la cuenta, inténtelo más tarde.",
        });
    }
});

export default router;