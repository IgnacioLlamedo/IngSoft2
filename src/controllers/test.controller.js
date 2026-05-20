import { usuarioDao } from "../daos/index.js";

export async function userAutoLoginController(req,res) {
    try {
        const user = await usuarioDao.readOne({mail: "user@test.com"});

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
        };
        //await req.session.save();

        return res.json({
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
        const user = await usuarioDao.readOne({mail: "employee@test.com"});

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
        };
        //await req.session.save();

        return res.json({
            success: true,
            redirect: "/home-employee",
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
        const user = await usuarioDao.readOne({mail: "admin@test.com"});

        req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
        };
        //await req.session.save();

        return res.json({
            success: true,
            redirect: "/home-admin",
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}