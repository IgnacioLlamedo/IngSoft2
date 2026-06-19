import { Schema, model } from "mongoose";

const collection = 'globales'

const globalesSchema = new Schema({
    id: { type: String, default: "1" },
    diasAviso: { type: Number, required: true }
}, {
    strict: 'throw',
    versionKey: false
})

export const Globales = model(collection, globalesSchema)