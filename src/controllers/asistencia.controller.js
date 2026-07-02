//import {claseEspecificaDao, asistenciaDao, usuarioDao, reservaDao} from '../daos/index.js'
import { claseEspecificaDao, asistenciaDao, usuarioDao, reservaDao, claseGeneralDao, actividadDao } from '../daos/index.js'

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
                message: "QR inválido"
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
        const nueva = await asistenciaDao.create({idUsuario: usuario.id, idClaseEspecifica: clase._id})
        
        console.log("Esta es la nueva asistencia registrada.")
        console.log(nueva)

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

        const fechaActual = new Date();
        const fechaClase = new Date(clase.fechaEspecifica);

        // Una hora antes de la clase
        /* const inicioVentana = new Date(fechaClase);
        inicioVentana.setHours(inicioVentana.getHours() - 1);

        const estaEnHorario =
            fechaActual >= inicioVentana &&
            fechaActual <= fechaClase;

        if (estaEnHorario){
            return res.json({
                success: false,
                message: "La asistencia puede realizarse hasta 1 hora previo a la clase.",
                estaEnHorario
            })
        } */

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

        console.log("Esta es la clase especifica encontrada: ");
        console.log(clase);
        console.log("Estos son los anotados dentro de esa clase especifica");
        console.log(clase.anotados);

        //Si existe, busco en la lista de anotados al usuario por dni
        
        const existeAnotado = clase.anotados.some(
            a => a.idUsuario === usuario._id
        );

        if (!existeAnotado){
            return res.json({
                success: false,
                message: "El usuario con DNI " + dni + " no tiene reserva en la clase."
            })
        }

        console.log("Este es el usuario que existe EN LISTA DE ANOTADOS: ");
        console.log(existeAnotado);

        //Si está anotado, busco la reserva
        let esUnica = true;

        let reserva;

        //Es una reserva única o mensual?
        if (existeAnotado.estado === 'mensualidad'){
            esUnica = false;
            reserva = await reservaDao.readOneMensual({
                idUsuario: usuario._id,
                "clases.idClase": clase._id
            });
        }
        else{
            reserva = await reservaDao.readOneUnica({
                idUsuario: usuario._id,
                idClaseEspecifica: clase._id
            });
        }
        //en teoria no debería poder entrar por acá, ya que si no es una reserva única
        //y no es una reserva mensual, no debería estar en la lista de anotados de la clase especifica.
        if (!reserva){
            console.log("Si estás leyendo esto NO SE QUE CARAJO HICISTE FLACO");
            return res.json({
                success: false,
                message: "El usuario no tiene reservada esta clase."
            })
        }
        
        /**
         * 
         * 
         * Y si en vez de crear una asistencia, ¿agrego un estado en
         * RESERVA y en CLASEESPECIFICA.anotados?
         * 
         * esto hace más fácil también consultar las asistencias en una clase
         * especifica y las asistencias de un usuario en sus reservas...
         * 
         */

        
        //Consulto si ya registró asistencia
        const asistencia = await asistenciaDao.readOne({idUsuario: usuario._id, idClaseEspecifica: clase._id})

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

export async function tieneAnotados(req, res){
    try {
        const { idClase, fecha } = req.body;

        const claseEspecifica = await claseEspecificaDao.readOne({ idClaseGeneral: idClase, fechaEspecifica: fecha })

        if (!claseEspecifica){
            return res.json({
                success: false,
                message: "La clase no tiene inscriptos."
            })
        }

        const fechaActual = new Date();
        const fechaClase = new Date(claseEspecifica.fechaEspecifica);

        // Una hora antes de la clase
        /* const inicioVentana = new Date(fechaClase);
        inicioVentana.setHours(inicioVentana.getHours() - 1);

        const estaEnHorario =
            fechaActual >= inicioVentana &&
            fechaActual <= fechaClase;

        if (estaEnHorario){
            return res.json({
                success: false,
                message: "La asistencia puede realizarse hasta 1 hora previo a la clase.",
                estaEnHorario
            })
        } */

        return res.json({
            success: true
        })
    }
    catch(error){
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}

export async function getUserAssistances(req, res) {
    try {
        const sessionUser = req.session && req.session.user;
        if (!sessionUser) {
            return res.status(403).json({ success: false, message: "Acceso denegado" });
        }

        // Traigo todas las asistencias del usuario
        const asistencias = await asistenciaDao.readMany({ idUsuario: sessionUser.id });

        const asistenciasConInfo = [];
        for (const a of asistencias) {
            const claseEspecifica = await claseEspecificaDao.readOne({ _id: a.idClaseEspecifica });
            if (claseEspecifica) {
                const claseGeneral = await claseGeneralDao.readOne(claseEspecifica.idClaseGeneral);
                const actividad = claseGeneral ? await actividadDao.readOne({ _id: claseGeneral.idActividad }) : null;

                asistenciasConInfo.push({
                    ...a,
                    actividad: actividad ? actividad.nombre : "Actividad desconocida",
                    dia: claseGeneral ? claseGeneral.día : "Día desconocido",
                    hora: claseGeneral ? claseGeneral.hora : "Hora desconocida",
                    fecha: claseEspecifica.fechaEspecifica
                });
            }
        }

        return res.json(asistenciasConInfo);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: "Error al obtener asistencias" });
    }
}