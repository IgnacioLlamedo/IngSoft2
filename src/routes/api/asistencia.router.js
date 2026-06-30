import express from "express";
import { obtenerQR, registrarQR, registrarDNI, tieneAnotados } from "../../controllers/asistencia.controller.js";


export const asistenciaRouter = express.Router();

//Mando idClase y fecha para buscar el idClaseEspecifica
asistenciaRouter.post('/asistenciaQR', registrarQR);
asistenciaRouter.post('/asistenciaDNI', registrarDNI);
asistenciaRouter.post('/obtenerQR', obtenerQR)
asistenciaRouter.post('/consulta-anotados-clase', tieneAnotados);