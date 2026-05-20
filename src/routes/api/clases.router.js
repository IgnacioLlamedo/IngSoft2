import express from "express";
import { getAllClases, postReservaUnica, postReservaMensual } from "../../controllers/clases.controller.js";


export const clasesRouter = express.Router();

clasesRouter.get('/get-all', getAllClases);

clasesRouter.post('/post-reserva-unica', postReservaUnica);
clasesRouter.post('/post-reserva-mensual', postReservaMensual);
