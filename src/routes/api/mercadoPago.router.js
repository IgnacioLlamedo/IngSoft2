import { Router } from "express";
import { crearPreferencia } from "../../controllers/mercadoPago.controller.js";

export const mercadoRouter = Router();

mercadoRouter.post("/crear-preferencia", crearPreferencia);