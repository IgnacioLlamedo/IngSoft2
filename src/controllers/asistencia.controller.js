import e from 'express';
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
        const usuario = req.session.user;

        //mover todo lo siguiente a una función y reutilizar acá y en registrarDNI
        //Si está anotado, busco en asistencias
        const existeAnotado = clase.anotados.some(
            a => a.idUsuario === usuario.id
        );

        if (!existeAnotado){
            return res.json({
                success: false,
                message: "El usuario no se encuentra anotado en la clase."
            })
        }

        //Mostrar en caso de que este en lista de espera.

        const asistencia = await asistenciaDao.readOne({idUsuario: usuario.id, idClaseEspecifica: clase._id});
        if (asistencia){
            return res.json({
                success: false,
                message:"El usuario ya tiene asistencia registrada."
            })
        }

        //Si NO tiene asistencia registrada, la creo y la retorno
        const nueva = await asistenciaDao.create({idUsuario: usuario.user.id, idClaseEspecifica: clase._id})

        return res.json({
            success: true,
            nueva
        })
    }
    catch(error) {
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}

//Función que utilizarán los empleados y administradores para obtener el token para generar el QR
export async function obtenerQR(req,res){
    try{

        const { idClase, fecha } = req.body;

        const clase = await claseEspecificaDao.readOne({idClaseGeneral: idClase, fechaEspecifica: fecha});

        if (!clase){
            return res.json({
                success: false,
                message: "La clase no tiene inscriptos."
            })
        }

        return res.json({
            success: true,
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
        const { idClase, fecha, dni } = req.body;

        //A partir del dni busco al cliente
        const usuario = await usuarioDao.readOne({dni: dni, rol: "cliente"})
        if (!usuario){
            return res.json({
                success: false,
                message: "DNI no encontrado. Intente nuevamente"
            })
        }

        console.log("El usuario con dni " + dni + " Tiene como datos: ");
        console.log(usuario);


        console.log("Buscando clase especifica con idClaseGeneral: ", idClase, " y fechaEspecifica: ", fecha);
        //busco la clase especifica que tiene el listado de anotados
        const clase = await claseEspecificaDao.readOne({idClaseGeneral: idClase, fechaEspecifica: fecha})

        
        if (!clase) {
            return res.json({
                success: false,
                message: "La clase seleccionada no tiene anotados."
            })
        }
        //Si existe, busco en la lista de anotados al usuario por dni
        
        const existeAnotado = clase.anotados.some(
            a => a.idUsuario === usuario.id
        );

        if (!existeAnotado){
            return res.json({
                success: false,
                message: "El usuario con DNI " + dni + " no tiene reserva en la clase."
            })
        }

        //Si está anotado, busco en asistencias
        console.log("La clase especifica encontrada desde registrarDNI: ");
        console.log(clase);
        let esUnica = true;

        //el usuario está anotado en esta clase especifica a traves de una reserva única?
        let reserva = await reservaDao.readOneUnica({
            idUsuario: usuario._id,
            idClaseEspecifica: clase._id
        });

        //si no es una reserva unica tiene que ser una reserva mensual.
        if (!reserva) {
            esUnica = false;
            reserva = await reservaDao.readOneMensual({
                idUsuario: usuario._id,
                "clases.idClase": clase._id
            });
        }

        //en teoria no debería poder entrar por acá, ya que si no es una reserva única
        //y no es una reserva mensual, no debería estar en la lista de anotados de la clase especifica.
        if (!reserva){

        }
        

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
            message: "Asistencia registrada correctamente.",
            nueva
        })

    }
    catch(error) {
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}