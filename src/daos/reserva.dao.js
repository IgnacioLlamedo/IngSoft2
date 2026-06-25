import { ReservaUnica, ReservaMensual } from "../models/reserva.mongoose.js";

export class reservaDao {
    async createUnica(datos){
        return await ReservaUnica.create(datos)
        console.log(datos)
    }
    async readOneUnica(query){
        const reserva = await ReservaUnica.findOne(query).lean()
        if(!reserva){
            //provisional, desarrollar luego
            console.log("error reserva " + query + " no encontrada")
        }
        return reserva
    }
    async readManyUnica(query) {
        return await ReservaUnica.find(query).lean()
    }
    async updateOneUnica(query, datos){
        const updated = await ReservaUnica.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOneUnica(query){
        const deleted = await ReservaUnica.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteManyUnica(query){
        const deleted = await ReservaUnica.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }

    async populateUnica(query){
        const populated = await ReservaUnica.find(query)
        .populate({
            path: 'idClaseEspecifica',
            populate: {
                path: 'idClaseGeneral',
                populate: [
                    { path: 'idActividad' },
                    { path: 'idProfesor' },
                    { path: 'idSala' }
                ],
            }
        })
        .populate({
            path: 'pagos.idPago'
        })
        if(!populated){
            //provisional, desarrollar luego
            console.log("error en populate unica")
        }
        return populated
    }



    async createMensual(datos){
        return await ReservaMensual.create(datos)
        console.log(datos)
    }
    async readOneMensual(query){
        const reserva = await ReservaMensual.findOne(query).lean()
        if(!reserva){
            //provisional, desarrollar luego
            console.log("error reserva " + query + " no encontrada")
        }
        return reserva
    }
    async readManyMensual(query) {
        return await ReservaMensual.find(query).lean()
    }
    async updateOneMensual(query, datos){
        const updated = await ReservaMensual.findOneAndUpdate({ _id: query }, datos, { returnDocument: 'after' }).lean()
        if(!updated){
            //provisional, desarrollar luego
            console.log("error")
        }
        return updated
    }
    async deleteOneMensual(query){
        const deleted = await ReservaMensual.findOneAndDelete({ _id: query }).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }
    async deleteManyMensual(query){
        const deleted = await ReservaMensual.deleteMany(query).lean()
        if(!deleted){
            //provisional, desarrollar luego
            console.log("error")
        }
        return deleted
    }

    async populateMensual(query){
        const populated = await ReservaMensual.find(query)
        .populate({
            path: 'clases',
            populate: {
                path: 'idClase',
                populate: {
                    path: 'idClaseGeneral',
                    populate: [
                        { path: 'idActividad' },
                        { path: 'idProfesor' },
                        { path: 'idSala' }
                    ]
                }
            }
        })
        .populate({
            path: 'pagos.idPago'
        })
        if(!populated){
            //provisional, desarrollar luego
            console.log("error en populate mensual")
        }
        return populated
    }
}
