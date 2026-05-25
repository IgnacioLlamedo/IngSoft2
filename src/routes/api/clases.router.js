import express from "express";
import { getAllClases } from "../../controllers/clases.controller.js";
import { postReservaUnica, postReservaMensual } from "../../controllers/reservas.controller.js"

export const clasesRouter = express.Router();

clasesRouter.get('/get-all', getAllClases);

clasesRouter.post('/post-reserva-unica', postReservaUnica);
clasesRouter.post('/post-reserva-mensual', postReservaMensual);
