import { Cupo } from "../models/cupo.mongoose.js";

export class cupoDao {
    async create(datos){
        return await Cupo.create(datos)
    }
    async readOne(query){
        const cupo = await Cupo.findOne(query).lean()
        if(!cupo){
            //provisional, desarrollar luego
            console.log("No se encontró ningún Cupo con id " + query)
        }
        return cupo
    }
    async readMany(query){
        return await Cupo.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Cupo.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error al actualizar el Cupo. -> no se encontró el Cupo con id: " + query);
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Cupo.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Cupo.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

