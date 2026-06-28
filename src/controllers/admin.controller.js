import { claseGeneralDao } from "../daos/index.js";
import { claseEspecificaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { sedeDao } from "../daos/index.js";
import { actividadDao } from "../daos/index.js";
import { globalesDao } from "../daos/index.js";
import { reservaDao } from "../daos/index.js";
import { Status } from '../constants/constants.js';
import { mailer } from "../servicios/mailer.servicio.js";














//profesor
export async function crearProfesor(req, res){
    try {
        const data = req.body;
        console.log("Crear profesor con datos: ", data);

        const intructorAlreadyExists = await profesorDao.readOne({ dni: req.body.dni });
        if (intructorAlreadyExists) {
            return res.json({
                success: false,
                message: "Error al crear el profesor. El profesor ingresado ya está registrado en el sistema."
            });
        };
        
        const newData = await profesorDao.create(data);

        res.json({
            success: true,
            message: "¡Creación de profesor realizada con éxito!"
        });
    }
    catch(error) {
        console.error("crearProfesor ERROR: ", error);
        res.json({
            success: false,
            message: "Error al crear profesor. Inténtelo de nuevo más tarde."
        });
    }
}


// Nota: No comparo el id ya que asumo que es el mismo al usarlo para buscar en la bd,
// ni tampoco estado, motivoEstado y fechasEstado ya que no las traigo del front
function isSameInstructor(data, currentInstructor) {
    const isSame =
        data.nombre === currentInstructor.nombre &&
        data.dni === currentInstructor.dni &&
        data.genero === currentInstructor.genero &&
        areDeepEqual(data.actividades, currentInstructor.actividades)
	return isSame;
}

function areDeepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

export async function modificarProfesor(req, res){
    try {
        const data = req.body;
        const currentInstructor = await profesorDao.readOne({ _id: data.id });

        if (isSameInstructor(data, currentInstructor)) {
            return res.json({
                success: false,
                message: "Error al modificar el profesor. No se han modificado datos."
            });
        }

        if (data.dni !== currentInstructor.dni) {
            const instructorWithSameDni = await profesorDao.readOne({ dni: data.dni });
            if (instructorWithSameDni) {
                return res.json({
                    success: false,
                    message: "Error al modificar el profesor. El DNI ya está registrado en el sistema."
                });
            }
        }

        await profesorDao.updateOne({ _id: data.id }, data);

        res.json({
            success: true,
            message: "¡Modificación de profesor realizada con éxito!"
        });
    }
    catch(error) {
        console.error("modificarProfesor ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar profesor. Inténtelo de nuevo más tarde."
        });
    }
}

export async function inhabilitarProfesor(req, res){
    try {
        const profesor = req.body;
        
        // DEBUG
        // const result = await profesorDao.readOne({ _id: profesor._id });
        const result = await profesorDao.updateOne({ _id: profesor._id }, profesor);

        if (!result) {
            return res.json({
                success: false,
                message: "Error al inhabilitar el profesor. No se encontró el profesor en el sistema."
            });
        }

        console.log("DEBUG: parte1");
        // Debo chequear si hay clases activas con ese profesor
        // De haberlas, corresponde suspenderla* y avisar vía email a los anotados
        // *Creo que no fue solicitada la cancelación en sí, ni tampoco la devolución del dinero
        //
        // 1) Obtengo todas las clases generales con ese profesor
        const generalClasses = await claseGeneralDao.readMany({ idProfesor: profesor._id });
        
        let cantClasesAfectadas = 0;
        let cantEmailsEnviados = 0;

        console.log("DEBUG: parte2");
        if (generalClasses.length > 0) {
            console.log("DEBUG: parte3");
            // 2) Obtengo todas las clases específicas con ese profesor y fecha posterior a la actual            
            const generalClassesIds = generalClasses.map((gc) => gc._id);
            const specificClasses = await claseEspecificaDao.readMany({
				$and: [
					{ fechaEspecifica: { $gte: profesor.fechasEstado.desde } },
					{ fechaEspecifica: { $lte: profesor.fechasEstado.hasta } },
				],
				idClaseGeneral: { $in: generalClassesIds },
			});
            cantClasesAfectadas = specificClasses.length;
            
            const activities = await actividadDao.readMany({});
            generalClasses.forEach((gc) => {
                gc.actividad = activities.find((a) => a._id === gc.idActividad).nombre;
            })

            // Y para cada clase específica...
            for (const sc of specificClasses) {
                console.log("parte4");
                // 3) Obtengo los usuarios afectados
                const anotados = sc.anotados.filter((a) => !a.estado || a.estado === "activo");
                const actividad = generalClasses.find((gc) => gc._id === sc.idClaseGeneral).actividad;

                for (const a of anotados) {
                    console.log("parte5");
                    // 4) Enviar emails
                    // DEBUG
                    await mailer.cancelledClass(a.mail, a.nombre, sc.fechaEspecifica, sc.actividad);
                    cantEmailsEnviados++;
                }
            }
        }

        const clasesMsg = cantClasesAfectadas > 0 ? `. ${cantClasesAfectadas} clases fueron canceladas por este suceso` : '';
        const emailsMsg = cantEmailsEnviados > 0 ? `. ${cantEmailsEnviados} emails fueron enviados` : '';
        console.log("modificarProfesor: ", clasesMsg, emailsMsg);
        const resultMsg = "Se actualizó el estado del profesor" + clasesMsg + emailsMsg + ".";
        
        res.json({
            success: true,
            message: resultMsg
        });
    }
    catch(error) {
        console.error("modificarProfesor ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar profesor. Inténtelo de nuevo más tarde."
        });
    }
}

export async function eliminarProfesor(req, res){
    try {
        const data = req.body;

        const clases = await claseGeneralDao.readMany({ idProfesor: data.id }); 
        if (clases.length > 0) {
            return res.json({
                success: false,
                message: "Error al eliminar profesor. Hay clases que corresponden a ese profesor, borre o edite primero las clases."
            });
        }

        const query = { _id: data.id };
        const newData = {
			estado: Status.DELETED,
			motivoEstado: data.motivoEstado,
			fechasEstado: { desde: Date.now(), hasta: null },
		};
        // DEBUG
        // await profesorDao.readOne(query);
        await profesorDao.updateOne(query, newData);

        res.json({
            success: true,
            message: "¡Eliminación de profesor realizada con éxito!"
        });
    }
    catch(error) {
        console.error("eliminarProfesor ERROR: ", error);
        res.json({
            success: false,
            message: "Error al eliminar profesor. Inténtelo de nuevo más tarde."
        });
    }
}

export async function getInstructors(req, res){
    try {
        const instructors = await profesorDao.readMany({});

        if(!instructors) {
            return res.json({
                success: false,
            })
        }

        res.json({
            success: true,
            data: instructors,
        });
    }
    catch(error) {
        console.error("getInstructors ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar los profesores. Inténtelo de nuevo más tarde."
        });
    }
}























//sala
export async function crearSala(req, res){
    try {
        let data = req.body;
        data.nombre = nameConvention(data.nombre);

        const roomAlreadyExists = await salaDao.readOne({nombre: req.body.nombre});
        if(roomAlreadyExists) {
            return res.json({
                success: false,
                message: "Error al crear la sala. La sala ingresada ya está registrada en el sistema."
            })
        }
        
        await salaDao.create(data)

        res.json({
            success: true,
            message: "¡Creación de sala realizada con éxito!"
        });
    }
    catch(error) {
        console.error("crearSala ERROR: ", error);
        res.json({
            success: false,
            message: "Error al crear sala. Inténtelo de nuevo más tarde."
        });
    }
}

export async function modificarSala(req, res) {
    try {
        let data = req.body
        data.nombre = nameConvention(data.nombre);

        const currentRoom = await salaDao.readOne({_id: data.id});
        
        if(
            (data.nombre === currentRoom.nombre) &&
            (data.limiteSala === currentRoom.limiteSala)
        ) {
            return res.json({
                success: false,
                message: "Error al modificar la sala. No se han modificado datos."
            })
        }

        if(data.nombre !== currentRoom.nombre) {
            const roomAlreadyExists = await salaDao.readOne({nombre: data.nombre});
            if(roomAlreadyExists) {
                return res.json({
                    success: false,
                    message: "Error al modificar la sala. El nuevo nombre de sala ingresado ya está registrado en el sistema."
                })
            }
        }

        console.log(data);
        if(data.limiteSala !== currentRoom.limiteSala){
            const clases = await claseGeneralDao.readMany({idSala: data.id})

            for(const clase of clases) {
                if(clase.limiteClase > data.limiteSala){
                    return res.json({
                        success: false,
                        message: "Error al modificar la sala. El cupo ingresado es menor al asignado en alguna de las clases de esta sala."
                    })
                }
            }
        }

        await salaDao.updateOne({_id: data.id}, data)

        res.json({
            success: true,
            message: "¡Modificación de sala realizada con éxito!"
        });
    }
    catch(error) {
        console.error("modificarSala ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar sala. Inténtelo de nuevo más tarde."
        });
    }
}

export async function eliminarSala(req, res){
    try {
        let data = req.body

        const clases = await claseGeneralDao.readMany({idSala: data.id})
        if(clases.length > 0){
            return res.json({
                success: false,
                message: "Error al eliminar sala. Hay clases que corresponden a esa sala, borre o edite primero las clases."
            });
        }

        await salaDao.deleteOne({_id: data.id})

        res.json({
            success: true,
            message: "¡Eliminación de sala realizada con éxito!"
        });
    }
    catch(error) {
        console.error("eliminarSala ERROR: ", error);
        res.json({
            success: false,
            message: "Error al eliminar sala. Inténtelo de nuevo más tarde."
        });
    }
}

export async function getRooms(req, res){
    try {
        const rooms = await salaDao.readMany({});

        if(!rooms) {
            return res.json({
                success: false,
            })
        }

        res.json({
            success: true,
            data: rooms,
        });
    }
    catch(error) {
        console.error("getRooms ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar las salas. Inténtelo de nuevo más tarde."
        });
    }
}














//sede (No se usa porque todo depende de ella)
export async function crearSede(req, res){
    try {
        let data = req.body
        data.nombre = nameConvention(data.nombre);

        const currentFacility = await sedeDao.readOne({_id: data.id});

        if(
            (data.nombre === currentFacility.nombre)
        ) {
            return res.json({
                success: false,
                message: "Error al modificar la sede. No se han modificado datos."
            })
        }

        const facilityAlreadyExists = await sedeDao.readOne({nombre: data.nombre});
        if(facilityAlreadyExists) {
            return res.json({
                success: false,
                message: "Error al modificar la sede. El nuevo nombre de sede ingresado ya está registrado en el sistema."
            })
        }

        await sedeDao.updateOne({_id: data.id}, data)

        res.json({
            success: true,
            message: "¡Modificación de sede realizada con éxito!"
        });
    }
    catch(error) {
        console.error("crearSede ERROR: ", error);
        res.json({
            success: false,
            message: "Error al crear sede. Inténtelo de nuevo más tarde."
        });
    }
}

export async function modificarSede(req, res){
    try {
        let data = req.body
        data.nombre = nameConvention(data.nombre);

        const currentFacility = await sedeDao.readOne({_id: data.id});

        if(data.nombre !== currentFacility.nombre) {
            const facilityAlreadyExists = await sedeDao.readOne(data);
            if(facilityAlreadyExists) {
                return res.json({
                    success: false,
                    message: "Error al modificar la sede. El nuevo nombre de sede ingresado ya está registrado en el sistema."
                })
            }
        }

        await sedeDao.updateOne({nombre: req.body.nombre}, data)

        res.json({
            success: true,
            message: "¡Modificación de sede realizada con éxito!"
        });
    }
    catch(error) {
        console.error("modificarSede ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar sede. Inténtelo de nuevo más tarde."
        });
    }
}

export async function eliminarSede(req, res){
    try {
        let data = req.body

        //Este no lo puedo probar porque no esta implementado lo de las sedes, pero da igual porque no lo vamos a usar, lo escribo solo por consistencia
        const salas = await sedeDao.readMany({_id: data.id}).salas
        if(salas.length > 0){
            return res.json({
                success: false,
                message: "Error al eliminar sede. Hay salas que corresponden a esa sede, borre o edite primero las salas."
            });
        }

        await sedeDao.deleteOne({_id: data.id})

        res.json({
            success: true,
            message: "¡Eliminación de sede realizada con éxito!"
        });
    }
    catch(error) {
        console.error("eliminarSede ERROR: ", error);
        res.json({
            success: false,
            message: "Error al eliminar sede. Inténtelo de nuevo más tarde."
        });
    }
}

export async function getFacilities(req, res){
    try {
        const facilities = await sedeDao.readMany({});

        if(!facilities) {
            return res.json({
                success: false,
            })
        }

        res.json({
            success: true,
            data: facilities,
        });
    }
    catch(error) {
        console.error("getFacilities ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar las sedes. Inténtelo de nuevo más tarde."
        });
    }
}






















//actividad
export async function crearActividad(req, res){
    try {
        let data = req.body
        data.nombre = nameConvention(data.nombre);

        const activityAlreadyExists = await actividadDao.readOne({nombre: req.body.nombre});
        if(activityAlreadyExists) {
            return res.json({
                success: false,
                message: "Error al crear la actividad. La actividad ingresada ya está registrada en el sistema."
            })
        }
        
        await actividadDao.create(data)

        res.json({
            success: true,
            message: "¡Creación de actividad realizada con éxito!"
        });
    }
    catch(error) {
        console.error("crearActividad ERROR: ", error);
        res.json({
            success: false,
            message: "Error al crear actividad. Inténtelo de nuevo más tarde."
        });
    }
}

export async function modificarNombreActividad(req, res){
    try {
        let data = req.body
        data.nombre = nameConvention(data.nombre);

        const currentActivity = await actividadDao.readOne({_id: data.id});

        if(
            (data.nombre === currentActivity.nombre)
        ) {
            return res.json({
                success: false,
                message: "Error al modificar la actividad. No se han modificado datos."
            })
        }

        const activityAlreadyExists = await actividadDao.readOne({nombre: req.body.nombre});
        if(activityAlreadyExists) {
            return res.json({
                success: false,
                message: "Error al modificar la actividad. El nuevo nombre de actividad ingresado ya está registrado en el sistema."
            })
        }

        await actividadDao.updateOne({_id: data.id}, data)

        res.json({
            success: true,
            message: "¡Modificación de actividad realizada con éxito!"
        });
    }
    catch(error) {
        console.error("modificarActividad ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar actividad. Inténtelo de nuevo más tarde."
        });
    }
}


export async function modificarPrecioActividad(req, res){
    try {
        let data = req.body

        const currentActivity = await actividadDao.readOne({_id: data.id});

        if(
            (data.precioMensual === currentActivity.precioMensual)
        ) {
            return res.json({
                success: false,
                message: "Error al modificar la actividad. No se han modificado datos."
            })
        }

        await actividadDao.updateOne({_id: data.id}, data)

        res.json({
            success: true,
            message: "¡Modificación de actividad realizada con éxito!"
        });
    }
    catch(error) {
        console.error("modificarActividad ERROR: ", error);
        res.json({
            success: false,
            message: "Error al modificar actividad. Inténtelo de nuevo más tarde."
        });
    }
}



export async function eliminarActividad(req, res){
    try {
        let data = req.body

        const clases = await claseGeneralDao.readMany({idActividad: data.id})
        if(clases.length > 0){
            return res.json({
                success: false,
                message: "Error al eliminar actividad. Hay clases que corresponden a esa actividad, borre o edite primero las clases."
            });
        }

        await actividadDao.deleteOne({_id: data.id})

        res.json({
            success: true,
            message: "¡Eliminación de actividad realizada con éxito!"
        });
    }
    catch(error) {
        console.error("eliminarActividad ERROR: ", error);
        res.json({
            success: false,
            message: "Error al eliminar actividad. Inténtelo de nuevo más tarde."
        });
    }
}


export async function getActivities(req, res){
    try {
        const activities = await actividadDao.readMany({});

        if(!activities) {
            return res.json({
                success: false,
            })
        }

        res.json({
            success: true,
            data: activities,
        });
    }
    catch(error) {
        console.error("getAllActivities ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar las actividades. Inténtelo de nuevo más tarde."
        });
    }
}


export async function getActivitiesStats(req, res){
    try {
        const activities = await actividadDao.readMany({});

        if (!activities) {
            return res.json({
                success: false,
            })
        }

        const reservations = await reservaDao.readManyMensual({});
        const generalClasses = await claseGeneralDao.readMany({});

        activities.forEach(a => a.abonados = 0);

        console.log("reservas mensuales: ", reservations);
        for (let r of reservations) {
            // Esto no hacía falta porque solo aplica a reservas únicas 🥲
            // if (r.idClase) {
            //     const generalClass = generalClasses.find(c => c._id === r.idClase);
            //     activities.find(a => a._id === generalClass.idActividad).abonados++;
            // } else

            // Si hay clases >> Obtengo idClaseEspecífica >> Busco claseEspecifica >>
            // >> Obtengo idClaseGeneral >> Busco claseGeneral >>
            // >> Obtengo idActividad >> Obtengo actividad >> Incremento actividad.abonados
            if (r.clases && r.clases.length > 0) {
                const idSpecificClass = r.clases[0].idClase;
                const specificClass = await claseEspecificaDao.readOne({ _id: idSpecificClass });
                if (!specificClass) continue;
                const idGeneralClass = specificClass.idClaseGeneral;
                const generalClass = generalClasses.find(gc => gc._id === idGeneralClass);
                if (!generalClass) continue;
                const activity = activities.find(a => a._id === generalClass.idActividad);
                if (activity) activity.abonados++;
            }
        }

        return res.json(activities);
    }
    catch(error) {
        console.error("getAllActivities ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar las actividades. Inténtelo de nuevo más tarde."
        });
    }
}



export async function actualizarDiasAviso(req, res){
    try {                                            //req.body.diasAviso es provisional
        await globalesDao.updateOne({id: "1"}, {diasAviso: req.body.diasAviso});
        res.json({
            success: true,
            message: "¡Modificaciones hechas con éxito!"
        });
    }
    catch(error) {
        console.error("actualizarDiasAviso ERROR: ", error);
        res.json({
            success: false,
            message: "Error al actualizar los días del aviso. Inténtelo de nuevo más tarde."
        });
    }
}


export async function recuperarDiasAviso(req, res){
    try {
        const data = await globalesDao.readOne({id: "1"});
        res.json({
            data,
        });
    }
    catch(error) {
        console.error("recuperarDiasAviso ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar los días del aviso. Inténtelo de nuevo más tarde."
        });
    }
}






function nameConvention(name) {
    return name.trim().charAt(0).toUpperCase() + name.trim().slice(1).toLowerCase();
}