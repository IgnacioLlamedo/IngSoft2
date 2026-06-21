import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto";

const collection = 'listaCandidatos'

const listaCandidatosSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idsClasesEspecificas: [{ type: String, ref: "clasesEspecificas" },],
    candidatos: [{
        idUsuario: { type: String, ref: "usuarios", required: true },
        //el tipo se puede obviar? ver
        tipo: { type:String, enum: ['mensualidad', 'unico', 'seña'], required: true }
    }],
    idUsuarioCancelado: { type: String, ref: 'usuarios', required: true },
    tipoCancelacion: { type: String, enum: ['mensualidad', 'unico', 'seña'], required: true },
    candidatoActual: {type: Number, default: 0 },
    estado: { type: String, enum: ['pendiente', 'completado',
        'sin_candidatos', 'expirado'], default: 'pendiente', required: true },
    fechaLimite: { type: Date, required: true },
}, {
    strict: 'throw',
    versionKey: false,
    timestamps: true
})

export const ListaCandidatos = model(collection, listaCandidatosSchema)