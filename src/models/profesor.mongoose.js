import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'profesores'

const profesorSchema = new Schema({
    _id: { type: String, default: randomUUID },
    dni: { type: String, required: true },
    nombre: { type: String, required: true },
    genero: { type: String, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Profesor = model(collection, profesorSchema)