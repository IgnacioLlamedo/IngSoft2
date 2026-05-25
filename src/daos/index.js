import mongoose from "mongoose";
import config from "../config.js";
import { usuarioDao as usuario } from "./usuario.dao.js";
import { actividadDao as actividad } from "./actividad.dao.js";
import { claseGeneralDao as claseGeneral } from "./claseGeneral.dao.js";
import { salaDao as sala } from "./sala.dao.js";
import { sedeDao as sede } from "./sede.dao.js";
import { profesorDao as profesor } from "./profesor.dao.js";
import { planillaDao as planilla } from "./planilla.dao.js";
import { pagoDao as pago } from "./pago.dao.js";
import { reservaDao as reserva } from "./reserva.dao.js";
import { claseEspecificaDao as claseEspecifica } from "./claseEspecifica.dao.js";

import dns from 'node:dns'
dns.setServers(['8.8.8.8', '8.8.4.4'])

try{
    await mongoose.connect(config.cnxStr)
    console.log("Base de datos conectada")
}
catch (error)
{
    console.error(error);
}


export const usuarioDao = new usuario()
export const actividadDao = new actividad()
export const claseGeneralDao = new claseGeneral()
export const claseEspecificaDao = new claseEspecifica()
export const salaDao = new sala()
export const sedeDao = new sede()
export const profesorDao = new profesor()
export const planillaDao = new planilla()
export const pagoDao = new pago()
export const reservaDao = new reserva()