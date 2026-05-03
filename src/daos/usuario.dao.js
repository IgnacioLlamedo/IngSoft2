import { Usuario } from "../models/usuario.mongoose.js";

export class usuarioDao {
    async create(datos){
        return await Usuario.create(datos)
    }
}

