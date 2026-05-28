import { usuarioDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
import { generateOtp } from '@mx7/otp';
import { mailer } from "../servicios/mailer.servicio.js";
import { hash, compareHash } from "../servicios/crypt.servicio.js";
import { Usuario } from "../models/usuario.mongoose.js";
import { homeRoute } from "../routes/web/web.router.js";

const errorMessages = {
	11000: "Error al crear la cuenta, el email ya está registrado.",
};

export async function postController(req, res) {
	try {
        const userData = req.body.userData;
        
        const emailExist = await usuarioDao.readOne({mail: userData.mail});
        if(emailExist) {
            return res.json({
                success: false,
                message: "Error al registrarse. El email ya se encuentra registrado."
            });
        }

        const dniExist = await usuarioDao.readOne({dni: userData.dni, rol:"cliente"});
        if(dniExist) {
            return res.json({
                success: false,
                message: "Error al registrarse. El DNI ya se encuentra registrado."
            });
        }

		const planilla = await planillaDao.create(req.body.planillaData);
        userData.planilla = planilla._id;

        userData.contraseña = hash(userData.contraseña)

		const user = await usuarioDao.create(userData);

        createSession(req, user);

        const redirect = homeRoute;
		res.json({
			success: true,
            redirect
		});
	} 
    catch (error) {
		console.error("postController ERROR: ", error);
		res.json({
			success: false,
			message:
				errorMessages[error.code] ||
				"Error al crear la cuenta, inténtelo más tarde.",
		});
	}
}

export async function loginController(req, res) {
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
        if(!(compareHash(password, user.contraseña))) {
            return res.json({
                success: false,
                message: "Error al Iniciar Sesión en la cuenta. La contraseña ingresada es incorrecta."
            });
        }


        let redirect = `/access/authentication?email=${mail}`;
        res.json({
            success: true,
            redirect
        })
    } 
    catch(error){
        console.error("loginController ERROR: ", error);
        res.json({
            success: false,
            message: "Error al iniciar sesión. Inténtelo más tarde."
        });
    }
}


export async function logoutController(req, res) {
	try {
		req.session.destroy(() => {
			//res.clearCookie("connect.sid");

			res.json({
				success: true,
			});
		});
	} catch (error) {
        console.error("logoutController ERROR: ", error);
		res.json({
			success: false,
			message: "Error al cerrar sesión. Inténtelo más tarde.",
		});
	}
}

export async function authenticationController(req, res) {
    try { 
        const mail = req.body.mail;
        const usuario = await usuarioDao.readOne({ mail: mail });

       if(usuario.codigo !== req.body.codigo){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código introducido es incorrecto."
            });
        }

        if(usuario.limiteCodigo.getTime() < new Date(Date.now()).getTime()){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código ya expiró."
            });
        }
        
        createSession(req, usuario);

        const redirect = homeRoute;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        console.error("authenticationController ERROR: ", error);
        res.json({
            success: false,
            message: "Error al validar el código. Inténtelo más tarde."
        });
    }
}

export async function authPass(req, res){
    try { 
        const mail = req.body.mail;
        const usuario = await usuarioDao.readOne({ mail: mail });

        if(usuario.codigo !== req.body.codigo){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código introducido es incorrecto."
            });
        }

        if(usuario.limiteCodigo.getTime() < new Date(Date.now()).getTime()){
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código ya expiró."
            });
        }
        
        const redirect = `/access/reset-password?email=${req.body.mail}`;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        console.error("authPass ERROR: ", error);
        res.json({
            success: false,
            message: "Error al validar el código. Inténtelo más tarde."
        });
    }
}

export async function crearCodigo(req, res){
    try {
        const expirationTime = 600000
        const limite = new Date(Date.now() + expirationTime)
        const otp = generateOtp()
        const usuario = await usuarioDao.updateOne(req.body.mail, {
            codigo: otp,
            limiteCodigo: limite
        })

        console.log("nuevo codigo: " + usuario.codigo)

        await mailer.auth(usuario.mail, otp)
        
        res.json({
            success: true,
            expirationTime,
        });
    } 
    catch(error) {
        console.error("crearCodigo ERROR: ", error);
        res.json({
            success: false,
            message: "Error al crear código de autenticación. Inténtelo más tarde."
        });
    }
}


export async function recoverPassword(req, res) {
    try {
        const user = await usuarioDao.readOne({mail: req.body.mail})

        if(!user) {
            return res.json({
                success: false,
                message: "Error al recuperar contraseña. El email no existe."
            });
        }

        const redirect = `/access/auth-pass?email=${req.body.mail}`;
        res.json({
            success: true,
            redirect,
        });
    }
    catch(error) {
        console.error("recoverPass ERROR: ", error);
        res.json({
            success: false,
            message: "Error al validar el email. Inténtelo más tarde."
        });
    }
}


export async function resetPass(req, res){
    try {
        const usuario = await usuarioDao.updateOne(req.body.mail, {
            contraseña: hash(req.body.contraseña)
        })

        if(!usuario) {
            return res.json({
                success: false,
                message: "Error al restablecer la contraseña, el usuario no existe." // No debería pasar, pero para que no explote mientras no validemos accesos.
            });
        }

        createSession(req, usuario);

        const redirect = homeRoute;
        res.json({
            success: true,
            redirect: redirect,
        });
    } 
    catch(error) {
        console.error("resetPass ERROR: ", error);
        res.json({
            success: false,
            message: "Error al cambiar contraseña. Inténtelo más tarde."
        });
    }
}

export async function loadProfileController(req, res) {
	try {
		// Return the current logged-in user's profile
		const sessionUser = req.session && req.session.user;		
		const mail = sessionUser.mail;
		
		if (!sessionUser || !mail) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}

		const user = await usuarioDao.readOne({mail: mail});

		if (!user) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}

		// Remove sensitive fields before sending
		const { contraseña, codigo, limiteCodigo, ...publicUser } = user;

		return res.json(publicUser);
	} catch (error) {
		console.error('accountController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al obtener perfil. Inténtelo más tarde.' });
	}
}


export async function saveProfileController(req, res) {
	try {
        const sessionUser = req.session && req.session.user;	
		const mail = sessionUser.mail;
        
		if (!sessionUser || !mail) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}
        
        const userData = req.body;
       
        const emailChanged = userData.mail !== mail
        if(emailChanged) {
            const emailExist = await usuarioDao.readOne({mail: userData.mail});
            if(emailExist) {
                return res.status(402).json({
                    success: false,
                    message: "Error al actualizar el perfil. El email ya se encuentra registrado."
                });
            }
        }

        const dniChanged = (await usuarioDao.readOne({mail: mail})).dni !== userData.dni;
        if(dniChanged) {
            const dniExist = await usuarioDao.readOne({dni: userData.dni, rol:sessionUser.rol});
            if(dniExist) {
                return res.status(402).json({
                    success: false,
                    message: "Error al actualizar el perfil. El DNI ya se encuentra registrado."
                });
            }
        }
	
		// Prevent updating password through this endpoint
		delete userData.contraseña;

		const updatedUser = await usuarioDao.updateOne(mail, userData);
		if (!updatedUser) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}

        if(emailChanged)
            changeEmailSession(req, userData.mail);

		return res.json(updatedUser);
	} catch (error) {
		console.error('saveProfileController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al actualizar perfil. Inténtelo más tarde.' });
	}
}


export async function checkPasswordController(req, res) {
	try {
		// Return the current logged-in user's profile
		const sessionUser = req.session && req.session.user;		
		const mail = sessionUser.mail;

		if (!sessionUser || !mail) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}
		const user = await usuarioDao.readOne({mail: mail});

		if (!user) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}
		
		const isPasswordCorrect = compareHash(req.body.contraseña, user.contraseña);
		
		//las contraseñas no son iguales debido al hasheo
		/* console.log('checkPasswordController received password:', req.body.contraseña);
		console.log('User password in DB:', user.contraseña); */

		return res.json({ success: isPasswordCorrect });
	} catch (error) {
		console.error('checkPasswordController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al obtener contraseña. Inténtelo más tarde.' });
	}
}


export async function setPasswordController(req, res) {
	try {
		const sessionUser = req.session && req.session.user;		
		const mail = sessionUser.mail;

		if (!sessionUser || !mail) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}

		const updatedData = req.body;

		if (!req.body.contraseña) {
			return res.status(400).json({ success: false, message: 'Contraseña no proporcionada' });
		}

		const updatedUser = await usuarioDao.updateOne(mail, { contraseña: hash(req.body.contraseña) });
		if (!updatedUser) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}
		return res.json(updatedUser);

	} catch (error) {
		console.error('savePasswordController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al actualizar contraseña. Inténtelo más tarde.' });
	}
}






async function createSession(req, user) {
    req.session.user = {
        id: user._id,
        mail: user.mail,
        rol: user.rol,
    };
    await req.session.save(); 
}


async function changeEmailSession(req, email) {
    req.session.user.mail = email;
    await req.session.save(); 
}