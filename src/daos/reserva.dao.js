import { Reserva } from "../models/reserva.mongoose.js";

export class reservaDao {
    async create(datos){
        return await Reserva.create(datos)
        console.log(datos)
    }
    async readOne(query){
        const reserva = await Reserva.findOne(query).lean()
        if(!reserva){
            //provisional, desarrollar luego
            console.log("error reserva " + query + " no encontrada")
        }
        return reserva
    }
    async readMany(query){
        return await Reserva.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Reserva.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Reserva.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Reserva.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

