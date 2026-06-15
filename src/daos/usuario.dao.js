import { Usuario, Empleado } from "../models/usuario.mongoose.js";

export class usuarioDao {
    async create(datos){
        console.log(`Ejecutando usuarioDao.create(datos).`);
        console.log(`datos: ${JSON.stringify(datos)}`);
        return await Usuario.create(datos)
    }

    async readOne(query){
        const usuario = await Usuario.findOne(query).lean();
        if(!usuario){
            //provisional, desarrollar luego
            console.log(`Ejecutando usuarioDao.readOne(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return usuario;
    }

    // TODO1: modificar los queries de readOne readOne para filtrar según estado
    async readMany(query){
        return await Usuario.find(query).lean();
    }
    
    // TODO2: mover el comportamiento de updateOneWithQuery a updateOne (y unificarlos)
    async updateOne(query, datos){
        const updated = await Usuario.findOneAndUpdate({ mail: query }, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`Ejecutando usuarioDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }
    async updateOneWithQuery(query, datos){
        const updated = await Usuario.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`Ejecutando usuarioDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }
    async deleteOne(query){
        const deleted = await Usuario.findOneAndDelete(query).lean();
        if(!deleted){
            //provisional, desarrollar luego
            console.log(`Ejecutando usuarioDao.deleteOne(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return deleted;
    }
    async deleteMany(query){
        const deleted = await Usuario.deleteMany(query).lean();
        if(!deleted){
            //provisional, desarrollar luego
            console.log(`Ejecutando usuarioDao.deleteMany(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return deleted;
    }
}

export class empleadoDao {
    async create(datos) {
        console.log(`Ejecutando empleadoDao.create(datos)`);
        console.log(`datos: ${JSON.stringify(datos)}`);
        return await Empleado.create(datos);
    }

    async verifyCode(code) {
        console.log(`Ejecutando empleadoDao.verifyCode(code)`);
        console.log(`code: ${JSON.stringify(code)}`);
        const empleado = await Empleado.findOne({ codigo: code }).lean();
        return empleado !== null;
    }

    async updateOneWithQuery(query, datos){
        const updated = await Empleado.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`Ejecutando usuarioDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }
}