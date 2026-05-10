import { Schema, model } from "mongoose";
import { randomUUID } from "node:crypto"

const collection = 'pagos'

const usuarioSchema = new Schema({
    _id: { type: String, default: randomUUID },
    monto: { type: Number, unique: true, required: true },
    idUsuario: { type: String, required: true, ref: 'usuarios' },
    idClase: { type: String, required: true, ref: 'clases' },
    fecha: { type: Date, required: true, default: Date.now() },
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

export const Pago = model(collection, usuarioSchema)

