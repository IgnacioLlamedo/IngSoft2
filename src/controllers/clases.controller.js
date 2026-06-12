import { actividadDao, reservaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { claseGeneralDao, claseEspecificaDao } from "../daos/index.js";

export async function getAllClases(req, res) {
    try {
        const fechaSemana = new Date(req.body.fechaSemana);
        console.log(fechaSemana);

        const inicioSemana = new Date(fechaSemana);
        const finSemana = new Date(fechaSemana);
        finSemana.setDate(finSemana.getDate() + 6);

        console.log("Esto es dentro de getallClases")
        console.log(inicioSemana)
        console.log(finSemana)

        const clasesData = await claseGeneralDao.readMany({});
        const claseEspecificaData = await claseEspecificaDao.readMany({
            //Busco las clases especificas dentro del rango
            fechaEspecifica: {
                $gte: inicioSemana,
                $lte: finSemana
            }
        });
        console.log(claseEspecificaData)
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
        const clases = req.body.clases;
        const claseAnotado = await claseEspecificaDao.updateOne({_id: clases[0].idClaseEsp}, {$push: {anotados: req.session.userId}});

        if (!claseAnotado) {
           //Crear clase especifica y agregar anotado
           const nuevaClaseEsp = await claseEspecificaDao.create({
                idClaseGeneral: clases[0].idClaseGeneral,
                fechaEspecifica: clases[0].fechaEspecifica,
                anotados: [req.session.userId],
                espera: []
            });
        }
        return res.json({
            success: true,
            message: "Ingresado a lista de espera correctamente"
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

export async function getSalas(req, res) {
    try {
        const salas = await salaDao.readMany({});
        if (!salas) {
            return res.json({
                success: false,
                message: "Error al conseguir salas"
            });
        }
        res.json({
            success: true,
            salas: salas
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
