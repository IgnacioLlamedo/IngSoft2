import { Asistencia } from "../models/asistencia.mongoose.js";

export class asistenciaDao {
    async create(datos){
        return await Asistencia.create(datos);
    }

    async readOne(query){
        const asist = await Asistencia.findOne(query).lean()
        if (!asist)
            console.log("No se encontró la asitencia buscada");
        return asist
    }
    async readMany(query){
        return await Asistencia.find(query).lean()
    }

    async updateOne(query, datos){
        console.log("Actualizando asistencia con query: ");
        console.log(query);
        console.log("Datos a actualizar: ");
        console.log(datos);
        const updated = await Asistencia.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error al actualizar asistencia");
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Asistencia.findOneAndDelete({ query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error al eliminar asistencia")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Asistencia.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error al eliminar asitenciassss")
        }
        return deleted
    }
    async populate(query){
        const populated = await Asistencia.find(query).populate([
            { path: 'idUsuario' },
            { 
                path: 'idClaseEspecifica',
                populate: {
                    path: 'idClaseGeneral',
                    populate: [
                        { path: 'idActividad' },
                        { path: 'idProfesor' },
                        { path: 'idSala' }
                    ]
                }
            }
        ])
        if(!populated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return populated
    }
}