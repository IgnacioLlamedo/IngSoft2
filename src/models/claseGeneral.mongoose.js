import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clasesGenerales'

const claseGeneralSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idActividad: { type: String, required: true, ref: 'actividades' },
    idSala: { type: String, required: true, ref: 'salas' },
    idProfesor: { type: String, required: true, ref: 'profesores' },
    limiteClase: { type: Number, required: true },
    dia: { type: String, required: true },
    hora: { type: Number, required: true },
    precioMensual: { type: Number, required: true },
}, {
    strict: 'throw',
    versionKey: false
})

export const ClaseGeneral = model(collection, claseGeneralSchema)