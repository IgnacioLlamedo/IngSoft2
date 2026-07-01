import { ClaseGeneral } from "../models/claseGeneral.mongoose.js";

export class claseGeneralDao {
    async create(datos){
        return await ClaseGeneral.create(datos)
    }
    async readOne(query){
        const clase = await ClaseGeneral.findOne(query).lean()
        if(!clase){
            //provisional, desarrollar luego
            console.log("ejecutando claseGeneralDao.readOne(query)")
        }
        return clase
    }
    async readMany(query){
        return await ClaseGeneral.find(query).lean()
    }
    async updateOne(query, datos){
        const updated = await ClaseGeneral.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOne(query){
        const deleted = await ClaseGeneral.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteMany(query){
        const deleted = await ClaseGeneral.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async populate(query){
        const populated = await ClaseGeneral.find(query).populate([
            { path: 'idActividad' },
            { path: 'idProfesor' },
            { path: 'idSala' }
        ])
        if(!populated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return populated
    }
}