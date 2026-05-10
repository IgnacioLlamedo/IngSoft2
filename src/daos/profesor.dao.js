import { Profesor } from "../models/profesor.mongoose.js";

export class profesorDao {
    async create(datos){
        return await Profesor.create(datos)
    }
    async readOne(query){
        const profesor = await Profesor.findOne({ _id: query }).lean()
        if(!profesor){
            //provisional, desarrollar luego
            console.log("error")
        }
        return profesor
    }
    async readMany(query){
        return await Profesor.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Profesor.findOneAndUpdate({ _id: query }, newData, { new: true }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Profesor.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Profesor.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

