import { asistencia } from "../models/asistencia.mongoose.js";

export class asistenciaDao {
    async create(datos){
        return await asistencia.create(datos);
    }

    async readOne(query){
        const asist = await asistencia.findOne(query).lean()
        if (!asist)
            console.log("No se encontró la asitencia buscada");
        return asist
    }
    async readMany(query){
        return await asistencia.find(query).lean()
    }

    async updateOne(query, datos){
        console.log("Actualizando asistencia con query: ");
        console.log(query);
        console.log("Datos a actualizar: ");
        console.log(datos);
        const updated = await asistencia.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error al actualizar asistencia");
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await asistencia.findOneAndDelete({ query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error al eliminar asistencia")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await asistencia.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error al eliminar asitenciassss")
        }
        return deleted
    }
}