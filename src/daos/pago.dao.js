import { Pago } from "../models/pago.mongoose.js";

export class pagoDao {
    async create(datos){
        return await Pago.create(datos)
    }
}

