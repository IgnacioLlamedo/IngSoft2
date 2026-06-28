import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'salas'

const salaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    nombre: { type: String, required: true },
    limiteSala: { type: Number, required: true },
    estado: { type: String, required: true, enum: ["disponible", "no disponible"] }
}, {
    strict: 'throw',
    versionKey: false
})

export const Sala = model(collection, salaSchema)

