import { Sede } from "../models/sede.mongoose.js";

export class sedeDao {
    async create(datos){
        return await Sede.create(datos)
    }
}

