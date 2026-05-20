import { profesorDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { sedeDao } from "../daos/index.js";
import { actividadDao } from "../daos/index.js";

//profesor
export async function crearProfesor(req, res){
    try {
        let data = req.body
        await profesorDao.create(data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function modificarProfesor(req, res){
    try {
        let data = req.body
        await profesorDao.updateOne({nombre: req.body.nombre}, data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function eliminarProfesor(req, res){
    try {
        let data = req.body
        await profesorDao.deleteOne({nombre: req.body.nombre})
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

//sala
export async function crearSala(req, res){
    try {
        let data = req.body
        await salaDao.create(data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function modificarSala(req, res){
    try {
        let data = req.body
        await salaDao.updateOne({nombre: req.body.nombre}, data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function eliminarSala(req, res){
    try {
        let data = req.body
        await salaDao.deleteOne({nombre: req.body.nombre})
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

//sede
export async function crearSede(req, res){
    try {
        let data = req.body
        await sedeDao.create(data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function modificarSede(req, res){
    try {
        let data = req.body
        await sedeDao.updateOne({nombre: req.body.nombre}, data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function eliminarSede(req, res){
    try {
        let data = req.body
        await sedeDao.deleteOne({nombre: req.body.nombre})
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

//actividad
export async function crearActividad(req, res){
    try {
        let data = req.body
        await actividadDao.create(data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function modificarActividad(req, res){
    try {
        let data = req.body
        await actividadDao.updateOne({nombre: req.body.nombre}, data)
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}

export async function eliminarActividad(req, res){
    try {
        let data = req.body
        await actividadDao.deleteOne({nombre: req.body.nombre})
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: error
        });
    }
}