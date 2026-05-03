import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'sedes'

const sedeSchema = new Schema({
    _id: { type: String, default: randomUUID },
    nombre: { type: String, required: true },
    salas : [{
        idSala: { type: String, ref: 'salas' },
    }]
}, {
    strict: 'throw',
    versionKey: false
})

export const Sede = model(collection, sedeSchema)

