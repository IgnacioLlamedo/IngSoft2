import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clases'

const claseSchema = new Schema({
    _id: { type: String, default: randomUUID },
    mail: { type: String, unique: true, required: true },
    contraseña: { type: String, required: true },
    nombre: { type: String, required: true },
    nacimiento: { type: String, required: true },
    telefono: { type: String, required: true },
    genero: { type: String, required: true },
    planilla: { type: String, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Clase = model(collection, claseSchema)