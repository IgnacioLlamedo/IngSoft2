import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'pagos'

const pagoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    monto: { type: Number, required: true },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    idClase: { type: String, required: true, ref: 'clasesEspecificas' },
    fecha: { type: Date, required: true },
}, {
    strict: 'throw',
    versionKey: false,
})

export const Pago = model(collection, pagoSchema)

