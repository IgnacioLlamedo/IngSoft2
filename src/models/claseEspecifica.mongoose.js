import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clasesEspecificas'

const claseEspecificaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClaseGeneral: { type: String, ref: "clasesGenerales" },
    tokenAsistencia: {
        type: String,
        default: randomUUID
    },
    anotados : [{
        idUsuario: { type: String, ref: 'usuarios', required: true },
        tipo: { type: String, enum: ['mensualidad', 'unico', 'seña'], required: true },
    }],
    espera : [{
        idUsuario: { type: String, ref: 'usuarios' }, //cambiar por mensual o todos los mensual por mensualidad jaja
        tipo: { type: String, enum: ['mensualidad', 'unico', 'seña'], required: true },
    }],
    esperaMensual : [{
        idUsuario: { type: String, ref: 'usuarios' },
        estado: { type: String, enum: ['activo', 'esperandoConfirmacion', 'aceptado', 'rechazado'], default: 'activo' }
    }],
    //Para lista de cancelados, simplemente recorremos las reservas de los usuarios.
    fechaEspecifica: { type: Date, required: true },
}, {
    strict: 'throw',
    versionKey: false
})

export const ClaseEspecifica = model(collection, claseEspecificaSchema)