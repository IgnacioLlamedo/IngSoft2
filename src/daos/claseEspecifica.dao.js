import { ClaseEspecifica } from "../models/claseEspecifica.mongoose.js";

export class claseEspecificaDao {
    async create(datos){
        return await ClaseEspecifica.create(datos)
    }
    async readOne(query){
        const clase = await ClaseEspecifica.findOne({ _id: query }).lean()
        if(!clase){
            //provisional, desarrollar luego
            console.log("error")
        }
        return clase
    }
    async readMany(query){
        return await ClaseEspecifica.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await ClaseEspecifica.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await ClaseEspecifica.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await ClaseEspecifica.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}