import { Usuario } from "../models/usuario.mongoose.js";

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
            console.log(`ERROR? al ejecutar usuarioDao.readOne(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return usuario;
    }
    async readMany(query){
        return await Usuario.find(query).lean();
    }
    async updateOne(query, datos){
        const updated = await Usuario.findOneAndUpdate({ mail: query }, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`ERROR? al ejecutar usuarioDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }
    async updateOneWithQuery(query, datos){
        const updated = await Usuario.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`ERROR? al ejecutar usuarioDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }    
    async deleteOne(query){
        const deleted = await Usuario.findOneAndDelete({ mail: query }).lean();
        if(!deleted){
            //provisional, desarrollar luego
            console.log(`ERROR? al ejecutar usuarioDao.deleteOne(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return deleted;
    }
    async deleteMany(query){
        const deleted = await Usuario.deleteMany(query).lean();
        if(!deleted){
            //provisional, desarrollar luego
            console.log(`ERROR? al ejecutar usuarioDao.deleteMany(query)`);
            console.log(`query: ${JSON.stringify(query)}`);
        }
        return deleted;
    }
}

