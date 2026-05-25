import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clasesEspecificas'

const claseEspecificaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClaseGeneral: { type: String, ref: "clasesGenerales" },
    anotados : [{
        idUsuario: { type: String, ref: 'usuarios', required: true },
        tipo: { type: String, enum: ['mensualidad', 'unico'], required: true },
    }],
    espera : [{
        idUsuario: { type: String, ref: 'usuarios' },
        tipo: { type: String, enum: ['mensualidad', 'unico'], required: true },
    }],
    fechaEspecifica: { type: Date, required: true },
}, {
    strict: 'throw',
    versionKey: false
})

export const ClaseEspecifica = model(collection, claseEspecificaSchema)