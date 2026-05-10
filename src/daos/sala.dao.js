import { Sala } from "../models/sala.mongoose.js";

export class salaDao {
    async create(datos){
        return await Sala.create(datos)
    }
    async readOne(query){
        const sala = await Sala.findOne({ _id: query }).lean()
        if(!sala){
            //provisional, desarrollar luego
            console.log("error")
        }
        return sala
    }
    async readMany(query){
        return await Sala.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Sala.findOneAndUpdate({ _id: query }, newData, { new: true }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Sala.findOneAndDelete({ _id: query }).lean()
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

