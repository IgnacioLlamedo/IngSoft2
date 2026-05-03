import mongoose from "mongoose";
import config from "../config.js";
import { usuarioDao as usuario } from "./usuario.dao.js";
import { actividadDao as actividad } from "./actividad.dao.js";
import { claseDao as clase } from "./clase.dao.js";
import { salaDao as sala } from "./sala.dao.js";
import { sedeDao as sede } from "./sede.dao.js";
import { profesorDao as profesor } from "./profesor.dao.js";

await mongoose.connect(config.cnxStr)
console.log("Base de datos conectada")

export const usuarioDao = new usuario()
export const actividadDao = new actividad()
export const claseDao = new clase()
export const salaDao = new sala()
export const sedeDao = new sede()
export const profesorDao = new profesor()