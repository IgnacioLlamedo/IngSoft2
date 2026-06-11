import { Schema, model } from "mongoose";
import { randomUUID } from 'node:crypto';

const collection = 'asistencias';

const asistenciaSchema = new Schema({
    _id: {type: String, default: randomUUID },
    idUsuario: { type: String, ref: 'usuarios', required: true},
    idClaseEspecifica: { type: String, ref: 'clasesEspecificas', required: true },
    
}, {
    strict: 'throw',
    versionKey: false
})

export const Actividad = model(collection, asistenciaSchema)