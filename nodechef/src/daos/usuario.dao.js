import { Usuario } from "../models/usuario.mongoose.js";

export class usuarioDao {
    async create(datos){
        return await Usuario.create(datos)
        console.log(datos)
    }
    async readOne(query){
        const usuario = await Usuario.findOne({ mail: query }).lean()
        if(!usuario){
            //provisional, desarrollar luego
            console.log("error usuario con mail " + query + " no encontrado")
        }
        return usuario
    }
    async readMany(query){
        return await Usuario.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await Usuario.findOneAndUpdate({ mail: query }, newData, { new: true }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await Usuario.findOneAndDelete({ mail: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await Usuario.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
}

