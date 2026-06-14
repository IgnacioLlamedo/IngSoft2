import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto";
import { Role, Status } from "../constants/constants.js";

const collection = 'usuarios'

/* Los clientes deben registrarse e iniciar sesión. Los datos solicitados para el registro de un cliente son: nombre completo, DNI, Fecha de nacimiento, Email, Número de teléfono, género y planilla médica. Los clientes menores a 14 años no pueden realizar el registro.  */

const usuarioSchema = new Schema({
    _id: { type: String, default: randomUUID },
    mail: { type: String, required: true },
    dni: { type: String, required: true },
    contraseña: { type: String, required: true },
    nombre: { type: String, required: true },
    nacimiento: { type: Date, required: true },
    telefono: { type: String, required: true },
    genero: { type: String, enum: ["femenino", "masculino", "otro"], required: true },
    planilla: { type: String, required: true, ref: "planillas" },
    // rol: { type: String, enum: ["cliente", "administrador", "empleado"], default: "cliente" },
    rol: { type: String, enum: [ Role.CLIENT, Role.ADMIN, Role.EMPLOYEE ], default: Role.CLIENT },
    estado: { type: String, enum: [Status.INACTIVE, Status.UNVERIFIED, Status.REGISTERED, Status.DELETED], default: Status.UNVERIFIED },
    motivoEstado: { type: String, default: '' },
    codigo: { type: String },
    limiteCodigo: { type: Date },
}, {
    strict: false,
    versionKey: false,
    /* methods: {
        public: function(){
            return {
                email: this.email,
                username: this.username
            }
        }
    } */
})

export const Usuario = model(collection, usuarioSchema)


const empleadoSchema = new Schema({
    _id: { type: String, default: randomUUID },
    mail: { type: String, required: true },
    dni: { type: String, required: true },
    contraseña: { type: String, required: true },
    nombre: { type: String, required: true },
    nacimiento: { type: Date, required: true },
    rol: { type: String, enum: [ Role.CLIENT, Role.ADMIN, Role.EMPLOYEE ], default: Role.CLIENT },
    estado: { type: String, enum: [Status.INACTIVE, Status.UNVERIFIED, Status.REGISTERED, Status.DELETED], default: Status.UNVERIFIED },
    motivoEstado: { type: String, default: '' },
}, {
    strict: false,
    versionKey: false
})

export const Empleado = model('Empleado', empleadoSchema, 'usuarios');