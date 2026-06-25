import { usuarioDao } from "../daos/index.js";

export async function userAutoLoginController(req,res) {
    try {
        // const query = { mail: "user@test.com" };
        const query = { _id: "878e3bdd-b1ab-4df4-8677-98d210df4a42" };
        const user = await usuarioDao.readOne(query);

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
            nombre: user.nombre,
        };
        await req.session.save();

        res.json({
            success: true,
            redirect: "/home",
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}


export async function employeeAutoLoginController(req,res) {
    try {
        const query = { _id: "bef468b9-b59f-4689-81d0-256c2c1a1a5f" };
        const user = await usuarioDao.readOne(query);

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
            nombre: user.nombre,
        };
        await req.session.save();

        res.json({
            success: true,
            redirect: "/home",
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}


export async function adminAutoLoginController(req,res) {
    try {
        const query = { _id: "a19d7c57-64ee-41d0-81e6-525a7d371382" };
        const user = await usuarioDao.readOne(query);

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
            nombre: user.nombre,
        };
        await req.session.save();

        res.json({
            success: true,
            redirect: "/home",
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}