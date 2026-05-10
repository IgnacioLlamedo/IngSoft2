import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'actividades'

const actividadSchema = new Schema({
    _id: { type: String, default: randomUUID },
    nombre: { type: String, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Actividad = model(collection, actividadSchema)

