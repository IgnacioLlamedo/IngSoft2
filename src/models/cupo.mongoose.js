import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'cupos'

const cupoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idUsuario: { type: String, ref: "usuarios", required: true},
    clasesEspecificas: [{ type: String, ref: "claseEspecifica" }],
    estado: { type: String, enum: ['pendiente', 'rechazado', 'aceptado'], required: true },
    tipo: { type: String, enum: ['mensual', 'unico', 'seña'], required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Cupo = model(collection, cupoSchema)