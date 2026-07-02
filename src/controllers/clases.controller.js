import { actividadDao, reservaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { claseGeneralDao, claseEspecificaDao } from "../daos/index.js";

export async function getAllClases(req, res) {
    try {
        const fechaSemana = new Date(req.body.fechaSemana);
        /* console.log(fechaSemana); */

        const inicioSemana = new Date(fechaSemana);
        const finSemana = new Date(fechaSemana);
        finSemana.setDate(finSemana.getDate() + 6);

        /* console.log("Esto es dentro de getallClases")
        console.log(inicioSemana)
        console.log(finSemana) */

        const clasesData = await claseGeneralDao.readMany({});
        const claseEspecificaData = await claseEspecificaDao.readMany({
            //Busco las clases especificas dentro del rango
            fechaEspecifica: {
                $gte: inicioSemana,
                $lte: finSemana
            }
        });
        /* console.log(claseEspecificaData) */
        const activitiesData = await actividadDao.readMany({});
        const salasData = await salaDao.readMany({});
        const profesoresData = await profesorDao.readMany({});

        let clasesTotal = [];
        for(let claseData of clasesData) {
            clasesTotal.push({
                clase: claseData,
                //Me traigo la clase especifica para hacer la cantidad de anotados.
                claseEsp: claseEspecificaData.find(c => c.idClaseGeneral === claseData._id),
                actividad: activitiesData.find(a => a._id === claseData.idActividad),
                sala: salasData.find(s => s._id === claseData.idSala),
                profesor:  profesoresData.find(p => p._id === claseData.idProfesor),
            })
        }
        
        res.json({
            success: true,
            clases: clasesTotal, //Devuelve clases generales, sin anotados ni espera, pero con la info de actividad, sala y profesor.
            // Para conseguir los anotados y la espera, se fija si existe una clase específica con la idClaseGeneral de la clase general que se está iterando,
            // y si existe, esa clase específica tiene el listado de anotados y de espera.
        });
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function crearClase(req, res){
    try {
        let data = req.body
        
        await claseGeneralDao.create(data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

/**
 * Consultas:
 * ¿los precios son de cada clase o hay precios generales?
 * 
 * En base a eso, cuando se realiza un aumento,¿se hace un aumento general o un aumento individual por clase?
 * Si se puede general, ¿también se puede individual?
 */

export async function ingresarAEspera(req, res) {
    try {
        /**
         * Si en req.body, decido traerme las clasesEspecificas encontradas
         * en consultar-clase, acá puedo hacer un for y decidir si hacer update
         * en cada una o no.
         */

        const clases = req.body.clases;
        const tipo = req.body.tipo;
        console.log("Desde ingresar a espera: ")
        console.log("En este session id: ", req.session.user.id)
        console.log("El tipo tiene formato: ", tipo);

        const nuevoEspera = {
            idUsuario: req.session.user.id,
            estado: "activo"
        }
        let tipoFormateado;
        if (tipo !== 'mensual'){
            nuevoEspera.tipo = "unico"
            tipoFormateado = "Unica"
        }
        else
            tipoFormateado = "Mensual"
        let claseAnotado;
        for(const especificaActual of clases){
            console.log(especificaActual)
            
            
            claseAnotado = await claseEspecificaDao.updateOne({_id: especificaActual.clase._id},
                {
                    $push: {
                        [`espera${tipoFormateado}`]: nuevoEspera
                    }
                }
            );
            if (!claseAnotado){
                console.log("Error al actualizar una de las listas de espera.")
                break;
            }
        }
       // const claseAnotado = await claseEspecificaDao.updateOne({_id: clases[0].clase._id}, {$push: {anotados: req.session.userId}});

        //En teoría no debería pasar que no exista la clase.
        if (!claseAnotado) { //Por lo que esto no tiene sentido.
            return res.json({
                success: false,
                message: "Clase especifica no existente"
            })
        }

        return res.json({
            success: true,
            message: "Ingresado a lista de espera correctamente"
        });
    }
    catch(error) {
        console.log(error);
        return res.json({
            success: false,
            message: error
        });
    }
}

export async function getSalas(req, res) {
    try {
        const salas = await salaDao.readMany({ estado: { $ne: "borrada" } });
        
        if (!salas) {
            return res.json({
                success: false,
                message: "Error al conseguir salas"
            });
        }

        // Las salas sin clases no tiene sentido mostrarlas
        const salasConClases = [];

        for (const sala of salas) {
            const existe = await claseGeneralDao.readOne({ idSala: sala._id });
            console.log(existe);
            if (existe) salasConClases.push(sala);
        }

        res.json({
            success: true,
            salas: salasConClases
        });
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}


export async function inhabilitarClaseEspecifica(req, res) {
    try {
        const claseEspecifica = req.body;
        const query = { _id: claseEspecifica._id };
        const datos = {
            _id: claseEspecifica._id,
            estado: "inhabilitada",
            motivoEstado: "Inhabilitada vía botón de inhabilitación",
            fechaEstado: Date.now(),
        }
        const result = await claseEspecificaDao.updateOne(query, datos);

        if (!result) {
            return res.json({
                success: false,
                message: "Error al inhabilitar la clase. No se encontró en el sistema."
            });
        }

        const resultMsg = await notificarClientesPorClaseEspecfica(claseEspecifica, "inhabilitada");

        res.json({
            success: true,
            message: resultMsg
        });
    }
    catch(error) {
        console.error("inhabilitarClaseEspecifica ERROR: ", error);
        res.json({
            success: false,
            message: "Error al inhabilitar la clase. Inténtelo de nuevo más tarde."
        });
    }
}


async function notificarClientesPorClaseEspecfica(clase, motivo) {
    // Debo chequear si la sala está activa y si su profesor está activo en esas fechas
    // De cumplirse todo, corresponde avisar vía email a los anotados
    //
    // 1) Obtengo la clase general
    const claseGeneral = await claseGeneralDao.readOne({ _id: clase.idClaseGeneral, estado: { $ne: "borrada" }});
    console.log("clase general asociada a la clase específica: ", claseGeneral);
    // 2) Obtengo la sala
    const sala = await salaDao.readOne({ _id: claseGeneral.idSala, estado: { $ne: "borrada" }});
    console.log("sala asociada a la clase específica: ", sala);

    let cantEmailsEnviados = 0;

    if (sala && sala.estado === "habilitada") {
        // 3) Obtengo su profesor
        const profesor = await profesorDao.readOne({ _id: claseGeneral.idProfesor, estado: { $ne: Status.DELETED } });
        console.log("profesor asociado a la clase general: ", profesor);

        // 4) Controlo que el profesor no esté inactivo para esa fecha
        const fechas = profesor.fechasEstado;
        if (
            profesor.estado === Status.REGISTERED ||
            (profesor.estado === Status.INACTIVE &&
            (fechas.desde > clase.fechaEspecifica || fechas.hasta < clase.fechaEspecifica))
        ) {
            // 5) Obtengo el nombre de la actividad
            const actividadObj = await actividadDao.readOne({ _id: claseGeneral.idActividad });
            const actividad = actividadObj.nombre;
            console.log("actividad asociada a la clase general: ", actividad);
            
            // 6) Obtengo los usuarios afectados
            const anotados = clase.anotados.filter((a) => !a.estado || a.estado === "activo");
            console.log("anotados: ", anotados);
            
            for (const a of anotados) {
                // 7) Enviar emails
                // DEBUG
                if (motivo === "rehabilitadas") {
                    await mailer.restoredClass(a.mail, a.nombre, clase.fechaEspecifica, actividad);

                }
                else await mailer.cancelledClass(a.mail, a.nombre, clase.fechaEspecifica, actividad);
                cantEmailsEnviados++;
            }
        }
    }

    const clasesMsg = (cantClasesAfectadas > 0)
        ? `. ${cantClasesAfectadas} clases fueron ${motivo} por este suceso`
        : '';
    const emailsMsg = (cantEmailsEnviados > 0)
        ? `. ${cantEmailsEnviados} emails fueron enviados`
        : '';
    const resultMsg = "Se actualizó el estado de la sala" + clasesMsg + emailsMsg + ".";
    return resultMsg;
}


export async function habilitarClaseEspecifica(req, res) {
    try {
        const claseEspecifica = req.body;
        const query = { _id: claseEspecifica._id };
        const datos = {
            _id: claseEspecifica._id,
            estado: "habilitada",
            motivoEstado: "Habilitada vía botón de inhabilitación",
            fechaEstado: Date.now(),
        }
        const result = await claseEspecificaDao.updateOne(query, datos);

        if (!result) {
            return res.json({
                success: false,
                message: "Error al habilitar la clase. No se encontró en el sistema."
            });
        }

        const resultMsg = await notificarClientesPorClaseEspecfica(claseEspecifica, "habilitada");

        res.json({
            success: true,
            message: resultMsg
        });
    }
    catch(error) {
        console.error("inhabilitarClaseEspecifica ERROR: ", error);
        res.json({
            success: false,
            message: "Error al inhabilitar la clase. Inténtelo de nuevo más tarde."
        });
    }
}