import { Clase } from "../models/clase.mongoose.js";

export class claseDao {
    async create(datos){
        return await Clase.create(datos)
    }
    async readOne(query){
        const clase = await Clase.findOne({ _id: query }).lean()
        if(!clase){
            //provisional, desarrollar luego
            console.log("error")
        }
        return clase
    }
    async readMany(query){
        return await Clase.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Clase.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Clase.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Clase.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}