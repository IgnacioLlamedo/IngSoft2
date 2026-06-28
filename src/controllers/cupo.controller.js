import { cupoDao, claseEspecificaDao, claseGeneralDao, actividadDao } from "../daos/index.js";
import { validarYNotificar, eliminarDeClase } from "./reservas.controller.js"

export async function createCupo(req, res) {
    try {
        await cupoDao.create(req.body.data);

        res.json({
            success: true,
        });
    }
    catch(error) {
        console.error("createCupo ERROR: ", error);
		res.json({
			success: false,
			message: "Error al crear cupo. Inténtelo de nuevo más tarde.",
		});
    }
}

export async function getCupoData(req, res) {
    try {
        const cupo = await cupoDao.readOne({ _id: req.query.idCupo });

        const specificClasses = await Promise.all(
            cupo.clasesEspecificas.map(idSpecificClass =>
                claseEspecificaDao.readOne({ _id: idSpecificClass })
            )
        );

        const generalClass = await claseGeneralDao.readOne({ _id: specificClasses[0].idClaseGeneral });

        const activity = await actividadDao.readOne({ _id: generalClass.idActividad });

        const data = {
            idGeneralClass: generalClass._id,
            specificClasses: specificClasses,
            activity: activity.nombre,
            day: generalClass.dia,
            hour: generalClass.hora,
            price: activity.precioMensual,
            type: cupo.tipo,
            state: cupo.estado,
        }

        res.json({
            success: true,
            data
        });

    }   
    catch(error) {
        console.error("getCupoData ERROR: ", error);
		res.json({
			success: false,
			message: "Error al recuperar los datos del cupo, quizás éste no exista. Inténtelo de nuevo más tarde.",
		});
    } 
}


export async function acceptCupo(req, res) {
    try{
        let cupoData = await cupoDao.readOne({ _id: req.body.idCupo });
        cupoData.estado = 'aceptado';

        await cupoDao.updateOne({ _id: cupoData._id }, cupoData);
        
        for(const claseAct in cupoData.clasesEspecificas){
            //La persona que rechaza el cupo (y si es mensual), rechaza las 4 clases dentro del cupo.
            await claseEspecificaDao.updateOne({_id: claseAct._id},
                {
                    $set: {
                        // Reemplaza al usuario cancelado en anotados
                        "anotados.$[anotado].idUsuario": req.session.user.id,
                        "anotados.$[anotado].tipo": cupoData.tipo,
                        "anotados.$[anotado].estado": "activo",

                        // Actualiza su estado en la lista de espera
                        [`espera${cupoData.tipo}.$.estado`]: "aceptado"
                    }
                },
                {
                    arrayFilters: [
                        {
                            "anotado.idUsuarioD": cupoData.idUsuarioCanceloClase,
                            "anotado.estado": "cancelado"
                        },
                        { "espera.idUsuario": req.session.user.id }
                    ]
                }
            );
        }
        res.json({
            success: true,
        });
    }
    catch(error) {
        console.error("acceptCupo ERROR: ", error);
		res.json({
			success: false,
			message: "Error al aceptar el cupo. Inténtelo de nuevo más tarde.",
		});
    }
}

export async function rejectCupo(req, res) {
    try{
        let cupoData = await cupoDao.readOne({ _id: req.body.idCupo });
        
        cupoData.estado = 'rechazado';

        await cupoDao.updateOne({ _id: cupoData._id }, cupoData);

        let reemplazado;

        let claseLiberada;
        for(const claseAct in cupoData.clasesEspecificas){
            //La persona que rechaza el cupo (y si es mensual), rechaza las 4 clases dentro del cupo.
            await claseEspecificaDao.updateOne({_id: claseAct._id, [`espera${cupoData.tipo}.idUsuario`]: req.session.user.id},
            { 
                $set:{
                    [`espera${cupoData.tipo}.$.estado`]:"rechazado"
                }
            })
            if (claseAct.esLiberada)
                //Me guardo la clase que habia sido cancelada en un principio.
                claseLiberada = claseAct.clase;
        }

        //Busco el siguiente candidato a pasar a lista de anotados y lo notifico.
        reemplazado = await validarYNotificar(cupoData.tipo, claseLiberada);

        //Si no existe nadie más que pueda ser notificado para aceptar el cupo,
        //elimino al usuario que canceló la clase la primera vez.
        if(!reemplazado){
            await eliminarDeClase(cupoData.idUsuarioCanceloClase, claseLiberada);
        }

        res.json({
            success: true,
        });
    }
    catch(error) {
        console.error("rejectCupo ERROR: ", error);
		res.json({
			success: false,
			message: "Error al rechazar el cupo. Inténtelo de nuevo más tarde.",
		});
    }
}