import { Profesor } from "../models/profesor.mongoose.js";

export class profesorDao {
    async create(datos){
        return await Profesor.create(datos)
    }
}

