import { Planilla } from "../models/planilla.mongoose.js";

export class planillaDao {
    async create(datos){
        return await Planilla.create(datos)
    }
}
