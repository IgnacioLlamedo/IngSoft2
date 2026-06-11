import {claseEspecificaDao, asistenciaDao, usuarioDao} from '../daos/index.js'

/**
 * función que utilizará el cliente para registrar asistencia
 */
export async function registrarQR(req,res) {
    try {

        //obtengo la clase especifica con el qr leído
        const { token } = req.body;
        const clase = await claseEspecificaDao.readOne({tokenAsistencia: token});

        if (!clase){
            return res.json({
                success: false,
                message: "Clase especifica con token dado no encontrada. "
            })
        }
        //si la clase existe, busco si ya registró su asistencia
        const usuario = req.session;
        console.log("La sesión del usuario es: ")
        console.log(usuario);

        //Si está anotado, busco en asistencias
        let existeAnotado;
        for(const anotado in clase.anotados){
            if (anotado.idUsuario === usuario._id){
                existeAnotado = true;
                break;
            }
        }

        if (!existeAnotado){
            return res.json({
                success: false,
                message: "El DNI de usuario no se encuentra anotado en la clase."
            })
        }

        const asistencia = await asistenciaDao.findOne({idUsuario: usuario._id, idClaseEspecifica: clase._id});
        if (asistencia){
            return res.json({
                success: false,
                message:"El usuario ya tiene asistencia registrada."
            })
        }

        //Si NO tiene asistencia registrada, la creo y la retorno
        const nueva = await asistenciaDao.create({idUsuario: usuario._id, idClaseEspecifica: clase._id})

        return res.json({
            success: true,
            nueva
        })
    }
    catch(error) {
        console.error(error);
        return res.error({
            success: false,
            message: error
        })
    }
}

//Función que utilizarán los empleados y administradores para obtener el token para generar el QR
export async function obtenerQR(req,res){
    try{

        const { idClase, fecha } = req.params;
        const clase = await claseEspecificaDao.readById({idClaseGeneral: idClase, fechaEspecifica: fecha});

        if (!clase){
            return res.json({
                success: false,
                message: "Clase especifica no encontrada"
            })
        }

        return res.json({
            token: clase.tokenAsistencia
        });
    }
    catch(error){
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}

//Función back para controlar que el DNI existe y registrarlo
export async function registrarDNI(req,res) {
    try {
        const { idClase, fecha } = req.params;

        //A partir del dni busco al cliente
        const dniUsuario = req.body.dni;

        const usuario = await usuarioDao.findOne({dni: dniUsuario, rol: "cliente"})
        if (!usuario){
            return res.json({
                success: false,
                message: "Usuario con dni inexistente"
            })
        }

        console.log("El usuario con dni " + dniUsuario + " Tiene como datos: ");
        console.log(usuario);


        //busco la clase especifica que tiene el listado de anotados
        const clase = await claseEspecificaDao.readOne({idClaseGeneral: idClase, fechaEspecifica: fecha})

        //Si existe, busco en la lista de anotados al usuario por dni
        if (!clase) {
            return res.json({
                success: false,
                message: "La clase especifica no existe -.- no tiene anotados"
            })
        }

        //Si está anotado, busco en asistencias
        let existeAnotado;
        for(const anotado in clase.anotados){
            if (anotado.idUsuario === usuario._id){
                existeAnotado = true;
                break;
            }
        }

        if (!existeAnotado){
            return res.json({
                success: false,
                message: "El DNI de usuario no se encuentra anotado en la clase."
            })
        }

        console.log("La clase especifica encontrada desde registrarDNI: ");
        console.log(clase);
        const asistencia = await asistenciaDao.findOne({idUsuario: usuario._id, idClaseEspecifica: clase._id})

        //si tiene asistencia registrada no hago nada.
        if (asistencia){
            return res.json({
                success: false,
                message: "El usuario ya tiene asistencia registrada."
            })
        }

        //Si NO tiene asistencia registrada, la creo y la retorno
        const nueva = await asistenciaDao.create({idUsuario: usuario._id, idClaseEspecifica: clase._id})

        return res.json({
            success: true,
            nueva
        })

    }
    catch(error) {
        console.error(error);
        return res.error({
            success: false,
            message: error
        })
    }
}