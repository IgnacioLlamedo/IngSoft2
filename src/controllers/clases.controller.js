import { actividadDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { claseDao } from "../daos/index.js";

export async function getAllClases(req, res) {
    try {
        const clasesData = await claseDao.readMany({});

        let clasesTotal = [];
        for(let claseData of clasesData) {
            clasesTotal.push({
                clase: claseData,
                actividad: await actividadDao.readOne(claseData.idActividad),
                sala: await salaDao.readOne(claseData.idSala),
                profesor:  await profesorDao.readOne(claseData.idProfesor),
            })
        }
        console.log(clasesTotal);
        res.json({
            success: true,
            clases: clasesTotal,
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

/**
 * Consultas:
 * ¿los precios son de cada clase o hay precios generales?
 * 
 * En base a eso, cuando se realiza un aumento,¿ se hace un aumento general o un aumento individual por clase?
 * Si se puede general, ¿también se puede individual?
 */