import { actividadDao, reservaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { claseDao } from "../daos/index.js";

export async function getAllClases(req, res) {
    try {
        const clasesData = await claseDao.readMany({});
        const activitiesData = await actividadDao.readMany({});
        const salasData = await salaDao.readMany({});
        const profesoresData = await profesorDao.readMany({});

        let clasesTotal = [];
        for(let claseData of clasesData) {
            clasesTotal.push({
                clase: claseData,
                actividad: activitiesData.find(a => a._id === claseData.idActividad),
                sala: salasData.find(s => s._id === claseData.idSala),
                profesor:  profesoresData.find(p => p._id === claseData.idProfesor),
            })
        }
        
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

export async function crearClase(req, res){
    try {
        let data = req.body
        
        await claseDao.create(data)
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
