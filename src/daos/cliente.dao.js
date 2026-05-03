import { Cliente } from "../models/cliente.mongoose.js";

export class clienteDao {
    async create(datos){
        return await Cliente.create(datos)
    }
}

