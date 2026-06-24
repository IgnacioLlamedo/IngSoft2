import { cupoDao, claseEspecificaDao, claseGeneralDao, actividadDao } from "../daos/index.js";

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
            price: generalClass.precioMensual, // ????? esto no lo teníamos en las actividades ?????
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


export async function rejectCupo(req, res) {
    try{
        let cupoData = await cupoDao.readOne({ _id: req.body.idCupo });
        cupoData.estado = 'rechazado';

        await cupoDao.updateOne({ _id: cupoData._id }, cupoData);

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