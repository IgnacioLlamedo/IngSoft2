import { ListaCandidatos } from "../models/listaCandidatos.mongoose.js";

export class listaCandidatosDao {
    async create(datos){
        return await ListaCandidatos.create(datos)
    }
    async readOne(query){
        const listaCandidatos = await ListaCandidatos.findOne(query).lean()
        if(!profesor){
            //provisional, desarrollar luego
            console.log("error")
        }
        return listaCandidatos
    }
    async readMany(query){
        return await ListaCandidatos.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await ListaCandidatos.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error al actualizar el listados de candidatoS ");
            console.log(query);
            console.log("Con los datos: ");
            console.log(datos);
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await ListaCandidatos.findOneAndDelete(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await ListaCandidatos.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}
