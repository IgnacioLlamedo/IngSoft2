import express from "express";
import { obtenerQR, registrarQR, registrarDNI } from "../../controllers/asistencia.controller";


export const asistenciaRouter = express.Router();

//Mando idClase y fecha para buscar el idClaseEspecifica
asistenciaRouter.post('/asistenciaQR/:idClase/:fecha', registrarQR);
asistenciaRouter.post('/asistenciaDNI/:idClase/:fecha', registrarDNI);
asistenciaRouter.get('/obtenerQR/:idClase/:fecha', obtenerQR)