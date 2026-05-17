import { usuarioDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
<<<<<<< HEAD
import { generateOtp } from '@mx7/otp';
=======
import { homeRoutes } from "../app.js";
>>>>>>> origin/Front-Facu

const errorMessages = {
    11000: "Error al crear la cuenta, el email ya está registrado.",
};

export async function postController(req, res) {
    try {
        const planilla = await planillaDao.create(req.body.planillaData);

        const userData = req.body.userData;
        userData.planilla = planilla._id;

        await usuarioDao.create(userData);

        res.json({
            success: true
        });
    }
    catch(error) {
        console.log("ERROR: " + error);
        res.json({
            success: false,
            message: errorMessages[error.code] || "Error al crear la cuenta, inténtelo más tarde.",
        });
    }
}


export async function loginController(req,res) {
    try {
        const mail = req.body.mail;
        const password = req.body.contraseña;

        const user = await usuarioDao.readOne(mail);

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


        let redirect = `/access/authentication?email=${mail}`;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error){
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}

export async function authenticationController(req,res) {
    try {



        /* req.session.user = {
            id: user._id,
            mail: user.mail,
            rol: user.rol,
        };

        const redirect = homeRoutes[user.rol];
        res.json({
            success: true,
            redirect
        }); */
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al validar el código. Inténtelo más tarde."
        });
    }
}

export async function logoutController(req,res) {
    try {
        req.session.destroy(() => {
            //res.clearCookie("connect.sid");

            res.json({
                success: true
            });
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al cerrar sesión. Inténtelo más tarde."
        });
    }
}

export async function crearCodigo(req, res){
    try {
        await usuarioDao.updateOne(req.body.mail, {
        codigo: generateOtp(),
        limiteCodigo: new Date(Date.now() + 600000)
    })
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al crear código de autenticación. Inténtelo más tarde."
        });
    }
}


