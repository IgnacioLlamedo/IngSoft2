import { ClaseEspecifica } from "../models/claseEspecifica.mongoose.js";

export class claseEspecificaDao {
    async create(datos){
        return await ClaseEspecifica.create(datos)
    }
    async readOne(query){
        const clase = await ClaseEspecifica.findOne(query).lean()
        if(!clase){
            //provisional, desarrollar luego
            console.log("No se encontró la clase específica. Se retornará NULL desde el readOne");
        }
        return clase
    }
    async readMany(query){
        return await ClaseEspecifica.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await ClaseEspecifica.findOneAndUpdate({ query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await ClaseEspecifica.findOneAndDelete({ query }).lean()
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
    async populate(query){
        const populated = await ClaseEspecifica.find(query).populate([
            {
                path: 'anotados',
                populate: {
                    path: 'idUsuario'
                }
            },
            {
                path: 'espera',
                populate: {
                    path: 'idUsuario'
                }
            },
            {
                path: 'idClaseGeneral',
                populate: [
                    { path: 'idActividad' },
                    { path: 'idProfesor' },
                    { path: 'idSala' }
                ]
            }
        ])
        if(!populated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return populated
    }
}