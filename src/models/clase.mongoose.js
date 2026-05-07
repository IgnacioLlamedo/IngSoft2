import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clases'

const claseSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idActividad: { type: String, required: true },
    idSala: { type: String, required: true },
    idProfesor: { type: String, required: true },
    anotados : [{
        idUsuario: { type: String, ref: 'usuarios', required: true },
        tipo: { type: String, enum: ['mensualidad', 'unico'], required: true },
    }],
    espera : [{
        idUsuario: { type: String, ref: 'usuarios' },
        tipo: { type: String, enum: ['mensualidad', 'unico'], required: true },
    }],
    limiteClase: { type: Number, required: true },
    dia: { type: String, required: true },
    hora: { type: Number, required: true },
}, {
    strict: 'throw',
    versionKey: false
})

export const Clase = model(collection, claseSchema)