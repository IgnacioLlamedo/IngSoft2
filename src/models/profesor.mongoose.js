import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto";
import { Status } from '../constants/constants.js';

const collection = 'profesores';

const profesorSchema = new Schema({
    _id: { type: String, default: randomUUID },
    dni: { type: String, required: true },
    nombre: { type: String, required: true },
    genero: { type: String, enum: ['femenino', 'masculino', 'otro'], required: true },    
    actividades: [{ type: String, ref: 'actividades', required: true }],
    estado: { type: String, enum: [Status.REGISTERED, Status.INACTIVE, Status.DELETED], required: true, default: Status.REGISTERED },
    motivoEstado: { type: String, default: 'Sin motivo especificado' },
    fechasEstado: {
        type: { 
            desde: { type: Date, default: () => new Date(Date.now()) },
            hasta: { type: Date, /* default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) */ } // 14 días de duración
        },
    }
}, {
    strict: 'throw',
    versionKey: false
});

export const Profesor = model(collection, profesorSchema);