import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'pagos'

const pagoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    monto: { type: Number, required: true },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    clases: [{
        idClase: {
            type: String,
            required: true,
            ref: 'clases'
        },
        fecha: {
            type: Date,
            required: true
        }
    }],
    pendiente: { type: Boolean, required: true}
}, {
    strict: 'throw',
    versionKey: false,
})

export const Pago = model(collection, pagoSchema)

