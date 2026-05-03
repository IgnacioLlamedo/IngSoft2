import { Actividad } from "../models/actividad.mongoose.js";

export class actividadDao {
    async create(datos){
        return await Actividad.create(datos)
    }
}

