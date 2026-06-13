import { usuarioDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
import { generateOtp } from '@mx7/otp';
import { mailer } from "../servicios/mailer.servicio.js";
import { hash, compareHash } from "../servicios/crypt.servicio.js";
import { Usuario } from "../models/usuario.mongoose.js";
import { homeRoute } from "../routes/web/web.router.js";
import { Role, Status } from "../constants/constants.js";

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
        const expirationTime = 20000
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

// obtener la información de un usuario a partr de su email
export async function loadProfileController(req, res) {
	try {
        const sessionUser = req.session && req.session.user;
		if (!sessionUser) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}        

        const queryMail = req.query && req.query.mail;
        // si no es admin, no puede acceder a perfiles que no sean el suyo
        if (sessionUser.rol !== Role.ADMIN && sessionUser.mail !== queryMail) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const user = await usuarioDao.readOne({ mail: queryMail });        
        if (!user) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

		// eliminar campos innecesarios
		const { contraseña, codigo, limiteCodigo, ...publicUser } = user;
		return res.json(publicUser);

	} catch (error) {
		console.error('loadProfileController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al obtener perfil. Inténtelo más tarde.' });
	}
}

export async function saveProfileController(req, res) {
	try {
        // console.log('saveProfileController llamado con body:', req.body);
        const sessionUser = req.session && req.session.user;	
        
		if (!sessionUser) {
            return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}
        
        const newUserData = req.body.userData;
        const oldUserData = req.body.originalValues;
        const oldEmail = oldUserData.email;
        const savingOwnData = sessionUser.mail === oldEmail;
        // si no es admin, no puede modificar perfiles que no sean el suyo
        if (sessionUser.rol !== Role.ADMIN && !savingOwnData) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const emailChanged = newUserData.mail !== oldEmail;
        // console.log('Email changed:', emailChanged);
        if (emailChanged) { 
            const emailExists = await usuarioDao.readOne({ mail: newUserData.mail });
            if (emailExists) {
                return res.status(402).json({
                    success: false,
                    message: "Error al actualizar el perfil. El email ya se encuentra registrado."
                });
            }
        }

        // no todos los roles poseen tienen dni (como el admin)
        // const dniChanged = (await usuarioDao.readOne({mail: userMail})).dni !== newUserData.dni;
        const dniChanged = newUserData.dni != null && (newUserData.dni !== oldUserData.dni);
        // console.log('DNI changed:', dniChanged);
        if (dniChanged) {
            const userRole = (await usuarioDao.readOne({ mail: oldEmail })).rol;
            const dniExists = await usuarioDao.readOne({dni: newUserData.dni, rol: userRole });
            if (dniExists) {
                return res.status(402).json({
                    success: false,
                    message: "Error al actualizar el perfil. El DNI ya se encuentra registrado."
                });
            }
        }
		const updatedUser = await usuarioDao.updateOne(oldEmail, newUserData);
		if (!updatedUser) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}

        if (emailChanged && savingOwnData)
            changeEmailSession(req, newUserData.mail);

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
		console.error('setPasswordController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al actualizar contraseña. Inténtelo más tarde.' });
	}
}


async function createSession(req, user) {
    req.session.user = {
        id: user._id,
        mail: user.mail,
        rol: user.rol,
        nombre: user.nombre,
    };
    await req.session.save(); 
}

async function changeEmailSession(req, email) {
    console.log('Cambiando session email a:', email);
    req.session.user.mail = email;
    await req.session.save(); 
}


export async function getUserlistController(req, res) {
    try {
        const sessionUser = req.session && req.session.user;

        if (!sessionUser || sessionUser.rol !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const query = req.query || {};

        return res.json(await usuarioDao.readMany(query));

    } catch (error) {
        console.error('getUserlistController ERROR: ', error);
        return res.status(500).json({ success: false, message: 'Error al obtener la lista de usuarios. Inténtelo más tarde.' });
    }
}


export async function deleteUserController(req, res) {
	try {
        console.log('deleteUserController llamado con body:', req.body);
        const sessionUser = req.session && req.session.user;

		if (!sessionUser || sessionUser.rol !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const userMail = req.body.mail;
        const motivoEstado = req.body.motivoEstado;
        console.log("")
        
        // const updatedUser = await usuarioDao.readOne({
        //     mail: userMail,
        //     $or: [
        //         { estado: { $exists: false } },
        //         { estado: { $ne: Status.DELETED } }
        //     ]
        // });
        const updatedUser = await usuarioDao.updateOneWithQuery({
            mail: userMail,
            $or: [
                { estado: { $exists: false } },
                { estado: { $ne: Status.DELETED } }
            ]
        }, {
            estado: Status.DELETED,
            motivoEstado: motivoEstado
        });

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        return res.json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('deleteUserController ERROR: ', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario. Inténtelo más tarde.' });
    }
}