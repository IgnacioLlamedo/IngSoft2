import { Sede } from "../models/sede.mongoose.js";

export class sedeDao {
    async create(datos){
        return await Sede.create(datos)
    }
    async readOne(query){
        const sede = await Sede.findOne({ _id: query }).lean()
        if(!sede){
            //provisional, desarrollar luego
            console.log("error")
        }
        return sede
    }
    async readMany(query){
        return await Sede.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Sede.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Sede.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Sede.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

