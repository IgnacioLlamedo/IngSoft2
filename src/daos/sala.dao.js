import { Sala } from "../models/sala.mongoose.js";

export class salaDao {
    async create(datos){
        return await Sala.create(datos)
    }
}

