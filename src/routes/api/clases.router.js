import express from "express";
import { getAllClases } from "../../controllers/clases.controller.js";


export const clasesRouter = express.Router();

clasesRouter.get('/get-all', getAllClases);

clasesRouter.post('/post-reserva', postReserva);
