import { usuarioDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
import { generateOtp } from '@mx7/otp';
import { homeRoutes } from "../app.js";
import { mailer } from "../servicios/mailer.servicio.js";
import { hash, compareHash } from "../servicios/crypt.servicio.js";

const errorMessages = {
    11000: "Error al crear la cuenta, el email ya está registrado.",
};

export async function postController(req, res) {
    try {
        const planilla = await planillaDao.create(req.body.planillaData);

        let userData = req.body.userData;
        userData.contraseña = hash(userData.contraseña)
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

        const user = await usuarioDao.readOne({ mail: mail });
        // usuario no encontrado
        if(!user) {
            return res.json({
                success: false,
                message: "Error al Iniciar Sesión en la cuenta. El email ingresado no está registrado."
            });
        }
        // Contraseña incorrecta
        if(compareHash(user.contraseña, password)) {
            return res.json({
                success: false,
                message: "Error al Iniciar Sesión en la cuenta. La contraseña ingresada es incorrecta."
            });
        }
        //Genero el código de acceso y lo cargo en la DB ---> No sé si esto era lo que queria hacer Nacho (?)
        const limite = new Date(Date.now() + 600000)
        const otp = generateOtp()
        const usuario = await usuarioDao.updateOne(mail, {
        codigo: otp,
        limiteCodigo: limite
        })
        console.log("enviando codigo: " + usuario.codigo)

        //Acá habria que mandar el mail con el código generado.
        await mailer.auth(mail, otp)

        let redirect = `/access/authentication?email=${mail}`;
        res.json({
            success: true,
            redirect
        })
    } 
    catch(error){
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}

export async function authenticationController(req, res) {
    try { 
        const mail = req.body.mail;
        //Vuelvo a buscar los datos del usuario, esta vez con el código
        const usuario = await usuarioDao.readOne({ mail: mail });

        //si se encontró el usuario y el código ingresado es igual al guardado en DB
       if(usuario.codigo != req.body.codigo){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación."
            });
        }
        if(usuario.limiteCodigo.getTime() < new Date(Date.now()).getTime()){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código ya expiró"
            });
        }

        req.session.user = {
            id: usuario._id,
            mail: usuario.mail,
            rol: usuario.rol,
        };
        
        const redirect = homeRoutes[usuario.rol];
        res.json({
            success: true,
            redirect
        });
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
        const limite = new Date(Date.now() + 600000)
        const otp = generateOtp()
        const usuario = await usuarioDao.updateOne(req.body.mail, {
        codigo: otp,
        limiteCodigo: limite
        })
        console.log("reenviando codigo: " + usuario.codigo)
        await mailer.auth(usuario.mail, otp)
        
        const redirect = `/access/auth-pass?email=${req.body.mail}`;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al crear código de autenticación. Inténtelo más tarde."
        });
    }
}

export async function authPass(req, res){
    try { 
        const mail = req.body.mail;
        //Vuelvo a buscar los datos del usuario, esta vez con el código
        const usuario = await usuarioDao.readOne({ mail: mail });

        //si se encontró el usuario y el código ingresado es igual al guardado en DB
       if(usuario.codigo != req.body.codigo){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación."
            });
        }
        if(usuario.limiteCodigo.getTime() < new Date(Date.now()).getTime()){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código ya expiró"
            });
        }
        
        const redirect = `/access/reset-password?email=${req.body.mail}`;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al validar el código. Inténtelo más tarde."
        });
    }
}

export async function resetPass(req, res){
    try {
        const usuario = await usuarioDao.updateOne(req.body.mail, {
            contraseña: hash(req.body.contraseña)
        })
        
        req.session.user = {
            id: usuario._id,
            mail: usuario.mail,
            rol: usuario.rol,
        };

        const redirect = homeRoutes[usuario.rol];
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        res.json({
            success: false,
            message: "Error al cambiar contraseña. Inténtelo más tarde."
        });
    }
}