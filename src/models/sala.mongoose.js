import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'salas'

const salaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    nombre: { type: String, required: true },
    limite: { type: Number, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Sala = model(collection, salaSchema)

