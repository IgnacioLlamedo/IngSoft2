import { Clase } from "../models/clase.mongoose.js";

export class claseDao {
    async create(datos){
        return await Clase.create(datos)
    }
}