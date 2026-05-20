import { Actividad } from "../models/actividad.mongoose.js";

export class actividadDao {
    async create(datos){
        return await Actividad.create(datos)
    }
    async readOne(query){
        const actividad = await Actividad.findOne({ _id: query }).lean()
        if(!actividad){
            //provisional, desarrollar luego
            console.log("error")
        }
        return actividad
    }
    async readMany(query){
        return await Actividad.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Actividad.findOneAndUpdate({ nombre: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Actividad.findOneAndDelete({ nombre: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Actividad.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

