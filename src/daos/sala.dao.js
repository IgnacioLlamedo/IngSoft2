import { Sala } from "../models/sala.mongoose.js";

export class salaDao {
    async create(datos){
        return await Sala.create(datos)
    }
    async readOne(query){
        const sala = await Sala.findOne(query).lean()
        if(!sala){
            //provisional, desarrollar luego
            console.log("error")
        }
        return sala
    }
    async readMany(query){
        return await Sala.find(query).sort({ nombre: 1 }).lean();
    }
    async updateOne(query, datos){
        const updated = await Sala.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Sala.findOneAndDelete(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Sala.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

