import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'reservas'
const options = {discriminatorKey:"kind"}

/* const reservaUnicaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    pagos: [{ idPago: {type: String, required: true, ref: 'pagos' }}],
    señada: {type: Boolean},
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
    fechaEspecifica: { type: Date },
    tipo: { type: String, default: "unica" },
}, {
    strict: false,
    versionKey: false,
})

const reservaMensualSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    pagos: [{ idPago: {type: String, required: true, ref: 'pagos'}}],
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
    fechas: [{fechaEspecifica: { type: Date }}],
    fechaVencimiento: { type: Date },
    tipo: { type: String, default: "mensual" },
}, {
    strict: false,
    versionKey: false,
}) */


const reservaSchema = new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    pagos: [{ idPago: {type: String, required: true, ref: 'pagos'}}],
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
}, {
    strict: false,
    versionKey: false,
    discrimatorKey: "tipo",
})


/* export const ReservaUnica = model(collection, reservaUnicaSchema)
export const ReservaMensual = model(collection, reservaMensualSchema) */
const Reserva = model(collection, reservaSchema)

export const ReservaUnica = Reserva.discriminator("ReservaUnica", new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    idPago: { type: String, required: true, ref: 'pagos' },
    señada: { type: Boolean },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
    fechaEspecifica: { type: Date },
    tipo: { type: String, default: "unica" },
}))

export const ReservaMensual = Reserva.discriminator("ReservaMensual", new Schema({
    _id: { type: String, default: randomUUID },
    idClase: { type: String, required: true, ref: 'clases' },
    pagos: [{ idPago: {type: String, required: true, ref: 'pagos'}}],
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    cancelada: { type: Boolean },
    fechas: [{fechaEspecifica: { type: Date }}],
    fechaVencimiento: { type: Date },
    tipo: { type: String, default: "mensual" },
}))