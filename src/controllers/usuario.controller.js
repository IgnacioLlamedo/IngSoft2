import { usuarioDao, empleadoDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
import { claseEspecificaDao } from "../daos/index.js";
import { generateOtp } from '@mx7/otp';
import { mailer } from "../servicios/mailer.servicio.js";
import { hash, compareHash } from "../servicios/crypt.servicio.js";
import { Usuario, Empleado } from "../models/usuario.mongoose.js";
import { homeRoute } from "../routes/web/web.router.js";
import { Role, Status } from "../constants/constants.js";

const errorMessages = {
	11000: "Error al crear la cuenta, el email ya está registrado.",
};

export async function postController(req, res) {
	try {
        const userData = req.body.userData;

        // Controlo que no exista un usuario con el mismo mail:
        // Si no existe o estado === DELETED, lo accepto.
        // Si estado === UNVERIFIED (registro incompleto), borro anterior y acepto.
        // Si estado === REGISTERED o INACTIVE (usuario registrado), lo rechazo. 
        const query = { mail: userData.mail, estado: { $ne: Status.DELETED } };
        const userWithSameEmail = await usuarioDao.readOne(query);
        console.log(`DEBUG: Usuario con mismo email: ${JSON.stringify(userWithSameEmail)}`);
        if (userWithSameEmail !== null) {
            if (userWithSameEmail.estado === Status.UNVERIFIED) {
                const deletedUnverifiedUser = await usuarioDao.deleteOne({ _id: userWithSameEmail._id });
                if (!deletedUnverifiedUser) {
                    return res.status(404).json({
                        success: false,
                        message: "No se pudo borrar el usuario anterior.",
                    });
                }
                console.log('INFO: Se encontró un usuario *no verificado* con el mismo email que el nuevo. Se ha eliminado.');
            }
            else return res.status(409).json({
                success: false,
                message: "Error al registrarse. El email ya se encuentra registrado."
            });
        }

        // Lo mismo que para el email, pero con el DNI
        const query2 = {
			dni: userData.dni,
			rol: Role.CLIENT,
			estado: { $ne: Status.DELETED },
		};
        const clientWithSameDni = await usuarioDao.readOne(query2);
        console.log(`DEBUG: Cliente con mismo DNI: ${JSON.stringify(clientWithSameDni)}`);
        if (clientWithSameDni !== null) {
            if (clientWithSameDni.estado === Status.UNVERIFIED) {
                const deletedUnverifiedClient = await usuarioDao.deleteOne({ _id: clientWithSameDni._id });
                if (!deletedUnverifiedClient) {
                    return res.status(404).json({
                        success: false,
                        message: "No se pudo borrar el usuario anterior.",
                    });
                }
                console.log('INFO: Se encontró un cliente no verificado con el mismo DNI que el nuevo. Se ha eliminado.');
            }
            else return res.status(409).json({
                success: false,
                message: "Error al registrarse. El DNI ya se encuentra registrado."
            });
        }

		const planilla = await planillaDao.create(req.body.planillaData);
        userData.planilla = planilla._id;
        userData.contraseña = hash(userData.contraseña);
        // El estado por defecto de un usuario nuevo va a ser UNVERIFIED
        userData.motivoEstado = 'Falta completar registro';

		const user = await usuarioDao.create(userData);

        const redirect = `/access/authentication?email=${userData.mail}`;
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


export async function postAuthenticationController(req, res) {
    // > Nuestro sistema de códigos, funciona poniendo el código en el usuario por medio de la db.
    // > Esto no tiene sentido ahora, ya que NO se debería crear el usuario hasta que se verifique el email.
    // Esto lo resolvemos buscando exclusivamente usuarios registrados en el login

    // > En caso de crear el usuario previamente a la verificación, entonces la verificación no tendría sentido,
    // > ya que se podría iniciar la sesión sin haber validado el email. O incluso, si se le corta la luz al
    // > momento de validar el email, entonces después no podrá registrarse ya que el email ya está registrado.
    // También se resuelve con la implementación de los estados (registrado o sin verificar)
    // En detalle: Al crear el usuario, se le asigna estado = Status.UNVERIFIED, se le envía un correo con el
    // código y se lo redirige a la página de verificación.
    // Una vez que ingrese el código, pasa a estado estado = Status.REGISTERED, se crea la sesión y redirige a
    // la home (igual que el login).
    // Ahora el otro tema, ¿qué pasa si es medio bobi y pierde la *página de verificación*?
    // En teoría (porque no probé aún), dado que la página de verificación usa el mail que está en la url para
    // buscar el código, la ruta va a ser siempre la misma para ese usuario (authentication?email=xx@x...).
    // Por lo tanto, esto se podría solucionar incluyendo un link en el correo que envía el código.
    // Queda pendiente rediseñar el correo envíado al cliente para que tenga el estilo del de empleados
    // y que incluya el link de verificación
    try {
        const mail = req.body.mail;
        const query1 = { mail: mail, estado: Status.UNVERIFIED };
        const user = await usuarioDao.readOne(query1);

       if (user.codigo !== req.body.codigo) {
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código introducido es incorrecto."
            });
        }

        if (user.limiteCodigo.getTime() < new Date(Date.now()).getTime()) {
            return res.json({
                success: false,
                message: "Error al ingresar el código de validación. El código ya expiró."
            });
        }
        
        const query2 = { _id: user._id };
        const datos = { estado: Status.REGISTERED, motivoEstado: "Registrado mediante código de verificación" };
        const updatedUser = await usuarioDao.updateOne(query2, datos);
        if (!updatedUser) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}

        createSession(req, updatedUser);

        const redirect = homeRoute;
        res.json({
            success: true,
            redirect
        });
    } 
    catch(error) {
        console.error("postAuthenticationController ERROR: ", error);
        res.json({
            success: false,
            message: "Error al validar el código. Inténtelo más tarde."
        });
    }
}





export async function loginController(req, res) {
	try {
		const mail = req.body.mail;
		const password = req.body.contraseña;

        const query = {
			mail: mail,
			$or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }],
		};
        const user = await usuarioDao.readOne(query);
        // usuario no encontrado
        if(!user) {
            return res.json({
                success: false,
                // message: "Error al Iniciar Sesión en la cuenta. El email ingresado no está registrado."
                message: "Error al iniciar sesión en la cuenta. El email o la contraseña son incorrectos."
            });
        }

        // Contraseña incorrecta
        if(!(compareHash(password, user.contraseña))) {
            return res.json({
                success: false,
                // message: "Error al Iniciar Sesión en la cuenta. La contraseña ingresada es incorrecta."
                message: "Error al iniciar sesión en la cuenta. El email o la contraseña son incorrectos."
            });
        }

        createSession(req, user);

        const redirect = homeRoute;
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


export async function authPass(req, res){
    try { 
        const mail = req.body.mail;
        const query = {
			mail: mail,
			$or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }],
		};
        const usuario = await usuarioDao.readOne(query);

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
        const expirationTime = 20000;
		const limite = new Date(Date.now() + expirationTime);
		const otp = generateOtp();

        const query = { mail: req.body.mail, estado: Status.UNVERIFIED };
        const datos = { codigo: otp, limiteCodigo: limite };
		const usuario = await usuarioDao.updateOne(query, datos);

        console.log("INFO: Nuevo código: " + usuario.codigo);

        await mailer.clientAuth(usuario.mail, usuario.nombre, otp);
        
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
        const query = {
			mail: req.body.mail,
			$or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }],
		};
        const user = await usuarioDao.readOne(query)

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
        const query = {
			mail: req.body.mail,
			$or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }],
		};
        const datos = { contraseña: hash(req.body.contraseña) };        
        const usuario = await usuarioDao.updateOne(query, datos);

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
        const sessionUser = req.session && req.session.user;
		if (!sessionUser) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}        

        const queryId = req.query && req.query.id;
        // si no es admin, no puede acceder a perfiles que no sean el suyo
        if (sessionUser.rol !== Role.ADMIN && sessionUser.id !== queryId) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        // const query = { mail: queryMail, $or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }] };
        const user = await usuarioDao.readOne({ _id: queryId });        
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
        // Si el mail coincide con algún registrado o que se está verificando, va a ser un problema
        if (emailChanged) { 
            const query1 = { mail: newUserData.mail, estado: { $ne: Status.DELETED }};
            const userWithSameEmail = await usuarioDao.readOne(query1);
            if (userWithSameEmail) {
                return res.status(409).json({
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
            const userRole = (await usuarioDao.readOne({ _id: newUserData.id })).rol;
            const query2 = { dni: newUserData.dni, rol: userRole, estado: { $ne: Status.DELETED } };
            const userWithSameDni = await usuarioDao.readOne(query2);
            if (userWithSameDni) {
                return res.status(409).json({
                    success: false,
                    message: "Error al actualizar el perfil. El DNI ya se encuentra registrado."
                });
            }
        }
        const query = { _id: newUserData.id };
        const updatedUser = await usuarioDao.updateOne(query, newUserData);
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
		const userId = sessionUser.id;

		if (!sessionUser || !userId) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}

        // const query = {
		// 	mail: mail,
		// 	$or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }],
		// };
		const user = await usuarioDao.readOne({ _id: userId });
		if (!user) {
			return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
		}
		
		// las contraseñas no son iguales debido al hasheo
		const isPasswordCorrect = compareHash(req.body.contraseña, user.contraseña);
		return res.json({ success: isPasswordCorrect });
	} catch (error) {
		console.error('checkPasswordController ERROR: ', error);
		res.status(500).json({ success: false, message: 'Error al obtener contraseña. Inténtelo más tarde.' });
	}
}


export async function setPasswordController(req, res) {
	try {
		const sessionUser = req.session && req.session.user;		
		const userId = sessionUser.id;

		if (!sessionUser || !userId) {
			return res.status(401).json({ success: false, message: 'Usuario no autenticado' });
		}

		const updatedData = req.body;

		if (!req.body.contraseña) {
			return res.status(400).json({ success: false, message: 'Contraseña no proporcionada' });
		}

        // const query = { mail: userId, $or: [{ estado: Status.REGISTERED }, { estado: Status.INACTIVE }] };
        const query = { _id: userId };
        const datos = { contraseña: hash(req.body.contraseña) };
		const updatedUser = await usuarioDao.updateOne(query, datos);
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
    console.log('Creada sesión de usuario:', req.session.user);
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


// TODO: Hasta donde probé anda, pero faltaría más testeo con casos reales
// para no borrar nada se puede reemplazar con el query debajo de la línea que dice DEBUG)
export async function deleteUserController(req, res) {
	try {
        console.log('deleteUserController llamado con body:', req.body);
        const sessionUser = req.session && req.session.user;

		if (!sessionUser || sessionUser.rol !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const userId = req.body.id;
        // Controlo si tiene reservas activas (o sin estado, por eso hay 2km de query) o está en una lista de espera...
        // ...para una clase que aún no haya comenzado
        const specificClass = await claseEspecificaDao.readOne({
			fechaEspecifica: { $gte: new Date() },
			$or: [
                {
                    anotados: {
                        $elemMatch: {
                            $and: [{ idUsuario: userId }, { $or: [{ estado: "activo" }, {estado: {$exists: false}}] } ],
                        },
                    },
                },
                { "espera.idUsuario": userId },
				{ "esperaUnica.idUsuario": userId },
				{ "esperaMensual.idUsuario": userId },
			],
		});
        console.log("specificClass: ", specificClass);
        if (specificClass) {
            const msg = "El usuario tiene reservas activas o se encuentra en una lista de espera.";
            return res.status(400).json({ success: false, message: msg });
        }
        
        const motivoEstado = req.body.motivoEstado;
        // Con solo _id debería ser suficiente, pero por las dudas que ya esté borrado...
        const query = { _id: userId, estado: { $ne: Status.DELETED } };
        const datos = { estado: Status.DELETED, motivoEstado: motivoEstado };
        // DEBUG
        // const updatedUser = await usuarioDao.readOne(query, datos);
        const updatedUser = await usuarioDao.updateOne(query, datos);

        if (!updatedUser) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado o ya está eliminado' });
        }

        return res.json({ success: true, message: 'Usuario eliminado correctamente.' });
    } catch (error) {
        console.error('deleteUserController ERROR: ', error);
        res.status(500).json({ success: false, message: 'Error al eliminar usuario. Inténtelo más tarde.' });
    }
}

export async function employeeSignUpController(req, res) {
	try {
        const sessionUser = req.session && req.session.user;

		if (!sessionUser || sessionUser.rol !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }
        
        const userData = req.body.userData;
                
        // Controlo que no exista un usuario con el mismo mail:
        // Si no existe o estado === DELETED, lo accepto.
        // Si estado === UNVERIFIED (registro incompleto), borro anterior y acepto.
        // Si estado === REGISTERED o INACTIVE (usuario registrado), lo rechazo.
        const query = { mail: userData.mail, estado: { $ne: Status.DELETED } };
        const userWithSameEmail = await usuarioDao.readOne(query);
        console.log(`DEBUG: Usuario con mismo email: ${JSON.stringify(userWithSameEmail)}`);
        if (userWithSameEmail !== null) {
            if (userWithSameEmail.estado === Status.UNVERIFIED) {
                const deletedUnverifiedUser = await usuarioDao.deleteOne({ _id: userWithSameEmail._id });
                if (!deletedUnverifiedUser) {
                    return res.status(404).json({
                        success: false,
                        message: "No se pudo borrar el usuario anterior.",
                    });
                }
                console.log('INFO: Se encontró un usuario *no verificado* con el mismo email que el nuevo. Se ha eliminado.');
            }
            else return res.status(409).json({
                success: false,
                message: "Error al registrarse. El email ya se encuentra registrado."
            });
        }

        // Lo mismo que para el email, pero con el DNI
        const query2 = {
			dni: userData.dni,
			rol: Role.EMPLOYEE,
			estado: { $ne: Status.DELETED },
		};
        const employeeWithSameDni = await usuarioDao.readOne(query2);
        console.log(`DEBUG: Empleado con mismo DNI: ${JSON.stringify(employeeWithSameDni)}`);
        if (employeeWithSameDni !== null) {
            if (employeeWithSameDni.estado === Status.UNVERIFIED) {
                const deletedUnverifiedEmployee = await usuarioDao.deleteOne({ _id: employeeWithSameDni._id });
                if (!deletedUnverifiedEmployee) {
                    return res.status(404).json({
                        success: false,
                        message: "No se pudo borrar el usuario anterior.",
                    });
                }
                console.log('INFO: Se encontró un empleado no verificado con el mismo DNI que el nuevo. Se ha eliminado.');
            }
            else return res.status(409).json({
                success: false,
                message: "Error al registrarse. El DNI ya se encuentra registrado."
            });
        }

        userData.contraseña = hash(crypto.randomUUID());
        // El estado por defecto de un usuario nuevo va a ser UNVERIFIED
        userData.motivoEstado = 'Falta completar registro';
        userData.codigo = crypto.randomUUID().slice(0, 8);

		const createdUserData = await empleadoDao.create(userData);
        await mailer.employeeAuth(createdUserData);
        
        return res.json({
            success: true,
        });
	} 
    catch (error) {
		console.error("postController ERROR: ", error);
		res.status(500).json({ success: false, message: 'Error al registrar empleado. Inténtelo más tarde.' });
	}
}


export async function employeeAuthController(req, res) {
	try {
		const sessionUser = req.session && req.session.user;

		if (sessionUser)
            return res.status(401).json({ success: false, message: 'Usuario ya autenticado' });

		const codigo = req.body.codigo;
		const contraseña = req.body.contraseña;

		if (!codigo || !contraseña)
			return res.status(400).json({ success: false, message: 'Datos no proporcionados' });
        
        const query = { codigo: codigo };
        const datos = {
            contraseña: hash(contraseña),
            estado: Status.REGISTERED,
            motivoEstado: "Registrado mediante enlace de verificación",
            codigo: '',
        };
        
        const updatedUser = await empleadoDao.updateOne(query, datos);

		if (!updatedUser)
			return res.status(404).json({ success: false, message: 'Código no encontrado' });
        
        createSession(req, updatedUser);

        const redirect = homeRoute;
		return res.json({ success: true, redirect });
		
        // return res.json({ success: true });

	} catch (error) {
		console.error('setPasswordController ERROR: ', error);
		res.status(500).json({
            success: false,
            message: 'Error al completar el registro. Inténtelo más tarde.'
        });
	}
}
