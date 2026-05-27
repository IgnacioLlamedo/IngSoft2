import { actividadDao, reservaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { claseGeneralDao, claseEspecificaDao } from "../daos/index.js";

export async function getAllClases(req, res) {
    try {
        const clasesData = await claseGeneralDao.readMany({});
        const claseEspecificaData = await claseEspecificaDao.readMany({});
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

/* export async function conseguirEspecifica(req, res) { No sirve jaja
    try {
        const idGeneral = req.body;

        const claseEspecifica = await claseEspecificaDao.readOne({idCLaseGeneral: idGeneral})
        return res.json({
            success: true,
            claseEspecifica: claseEspecifica
        })
    }
    catch(error){
        console.error(error);
        return res.json({
            success: false,
            message: "Error al conseguir clase especifica "
        })
    }
} */

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
