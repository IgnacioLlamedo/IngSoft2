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

    async readMany(query){
        return await Usuario.find(query).lean();
    }

    // Se Utiliza _id en lugar de mail para las búsquedas...
    // ...con readOne, updateOne y deleteOne (en donde sea posible)
    // Esto ahorra tener que incluir el estado en el query...
    // ...ya que podrían existir usuarios borrados con el mismo email
    async updateOne(query, datos){
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

    async updateOne(query, datos){
        const updated = await Empleado.findOneAndUpdate(query, datos, { returnDocument: 'after' }).lean();
        if(!updated){
            console.log(`Ejecutando empleadoDao.updateOne(query, datos)`);
            console.log(`query: ${JSON.stringify(query)} / datos: ${JSON.stringify(datos)}`);
        }
        return updated;
    }
}


export class administradorDao {}