import { Globales } from "../models/globales.mongoose.js";

export class globalesDao {
    async create(datos){
        return await Globales.create(datos)
    }

    async readOne(query){
        const globales = await Globales.findOne(query).lean()
        if(!globales){
            //provisional, desarrollar luego
            console.log("error")
        }
        return globales
    }

    async readMany(query){
        return await Globales.find(query).lean()
    }

    async updateOne(query, datos){
        const updated = await Globales.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error en globales dao")
        }
        return updated
    }

    async deleteOne(query){
        const deleted = await Globales.findOneAndDelete(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    
    async deleteMany(query){
        const deleted = await Globales.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

