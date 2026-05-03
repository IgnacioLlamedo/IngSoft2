import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'clientes'

/* Los clientes deben registrarse e iniciar sesión. Los datos solicitados para el registro de un cliente son: nombre completo, DNI, Fecha de nacimiento, Email, Número de teléfono, género y planilla médica. Los clientes menores a 14 años no pueden realizar el registro.  */

const userSchema = new Schema({
    _id: { type: String, default: randomUUID },
    mail: { type: String, unique: true, required: true },
    contraseña: { type: String, required: true },
    nombre: { type: String, required: true },
    nacimiento: { type: String, required: true },
    telefono: { type: String, required: true },
    genero: { type: String, required: true },
    planilla: { type: String, required: true }
}, {
    strict: 'throw',
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

export const Cliente = model(collection, userSchema)

