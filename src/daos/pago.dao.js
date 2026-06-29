import { Pago } from "../models/pago.mongoose.js";

export class pagoDao {
    async create(datos){
        return await Pago.create(datos)
    }
    async readOne(query){
        const pago = await Pago.findOne(query).lean()
        if(!pago){
            //provisional, desarrollar luego
            console.log("No se encontró ningún pago con id ")
            console.log(query);
        }
        return pago
    }
    async readMany(query){
        return await Pago.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Pago.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error al actualizar el pago. -> no se encontró el pago con id: " + query);
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Pago.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Pago.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

