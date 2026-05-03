import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'planillas'

const planillaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    dni: { type: String, required: true },
    nombre: { type: String, required: true },
    genero: { type: String, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Planilla = model(collection, planillaSchema)