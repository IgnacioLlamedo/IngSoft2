import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'cupos'

const cupoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idUsuario: { type: String, ref: "usuarios", required: true}, //Es el id del usuario que recibe el cupo
    idUsuarioCanceloClase: { type: String, ref: "usuarios", required: true},
    clasesEspecificas: [{
        clase: { type: String, ref: "claseEspecifica" },
        esLiberada: { type: Boolean, default: false }
    }],
    estado: { type: String, enum: ['pendiente', 'rechazado', 'aceptado'], default: 'pendiente' },
    tipo: { type: String, enum: ['Mensual', 'Unica', 'seña'], required: true },
}, {
    strict: 'throw',
    versionKey: false
})

export const Cupo = model(collection, cupoSchema)