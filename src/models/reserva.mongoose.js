import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'reservas'

const reservaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    idPago: { type: String, required: true, ref: 'pagos' },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
    fechaEspecifica: { type: Date },
}, {
    strict: false,
    versionKey: false,
})

export const Reserva = model(collection, reservaSchema)

