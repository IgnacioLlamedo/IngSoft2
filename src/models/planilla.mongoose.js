import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'planillas'

const planillaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    nombreEmergencia: { type: String, required: true },
    relacionEmergencia: { type: String, required: true },
    telefonoEmergencia: { type: String, required: true },
    //antecedentes medicos
    hipertension: { type: Boolean, required: true },
    diabetes: { type: Boolean, required: true },
    asma: { type: Boolean, required: true },
    cardiacos: { type: Boolean, required: true },
    artritis: { type: Boolean, required: true },
    epilepsia: { type: Boolean, required: true },
    lesiones: { type: Boolean, required: true },
    //
    otrosAntecedentes: { type: String },
    fuma: { type: Boolean, required: true },
    alcohol: { type: Boolean, required: true },
    sintomasRecientes: { type: Boolean, required: true },
    sueño: { type: Number, required: true },
    dificultadDormir: { type: Boolean, required: true },
    nutricion: { type: String },
    cirugia: { type: String },
    fechaCirugia: { type: Date },
    secuelasCirugia: { type: String },
    alergias: { type: String },
    medicacionAlergia: { type: String },
    actividadFisica: { type: Boolean, required: true },
    frecuenciaActividad: { type: String },
    //objetivo principal
    // 0 = Perdida de peso
    // 1 = Tonificacion
    // 2 = Salud
    // 3 = Competencia
    objetivo: { type: Number, enum: [ 0, 1, 2, 3 ], required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Planilla = model(collection, planillaSchema)