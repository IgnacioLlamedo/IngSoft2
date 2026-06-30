import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clasesEspecificas'

const claseEspecificaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClaseGeneral: { type: String, ref: "clasesGenerales" },
    tokenAsistencia: { type: String, default: randomUUID },
    anotados : [{
        idUsuario: { type: String, ref: 'usuarios', required: true },
        tipo: { type: String, enum: ['mensualidad', 'unico', 'seña'], required: true },
        estado: { type: String, enum: ['activo', 'cancelado'], default: 'activo' } //agregar 'asistida'?
    }],
    esperaUnica : [{
        idUsuario: { type: String, ref: 'usuarios' },
        tipo: { type: String, enum: ['unico', 'seña'], required: true }, //Esto me parece al pedo(?)
        estado: { type: String, enum: ['activo', 'esperandoConfirmacion', 'aceptado', 'rechazado'], defult: 'activo' }
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