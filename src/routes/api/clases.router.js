import express from "express";
import { getAllClases, ingresarAEspera, getSalas } from "../../controllers/clases.controller.js";
import { postReservaUnica, postReservaMensual } from "../../controllers/reservas.controller.js"

export const clasesRouter = express.Router();

clasesRouter.get('/get-all', getAllClases);
clasesRouter.get('/getSalas', getSalas);
//clasesRouter.get('/conseguir-especifica', conseguirEspecifica); no sirve

clasesRouter.post('/post-reserva-unica', postReservaUnica);
clasesRouter.post('/post-reserva-mensual', postReservaMensual);
clasesRouter.post('/ingresarAEspera', ingresarAEspera); 