import { Double } from "mongodb";
import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'pagos'

const pagoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    monto: { type: Double, required: true },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    clases: [{
        idClase: { type: String, required: true,ref: 'clasesGenerales' },
        fecha: { type: Date, required: true }
    }],
    clavePago: { type: String, required: true, index: true, unique: true }, //Es como un hasheo de las clases para identificar.
    fechaPago: { type: Date, required: true },
    idPreferencia: { type: String, default: null },
    initPoint: { type: String, default: null },
    estado: {
        type: String,
        enum: ['CREANDO', 'PENDIENTE', 'APROBADO', 'CANCELADO', 'EXPIRADO'],
        default: 'CREANDO'
    }
}, {
    strict: 'throw',
    versionKey: false,
})

export const Pago = model(collection, pagoSchema)

