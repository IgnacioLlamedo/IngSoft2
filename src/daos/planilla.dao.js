import { Planilla } from "../models/planilla.mongoose.js";

export class planillaDao {
    async create(datos){
        return await Planilla.create(datos)
    }
    async readOne(query){
        const planilla = await Planilla.findOne({ _id: query }).lean()
        if(!planilla){
            //provisional, desarrollar luego
            console.log("error")
        }
        return planilla
    }
    async readMany(query){
        return await Planilla.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Planilla.findOneAndUpdate({ _id: query }, newData, { new: true }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Planilla.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Planilla.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}
