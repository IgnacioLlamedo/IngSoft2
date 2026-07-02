import express from "express";
import { getMyReservations, cancelarReservaRefactorizadoJsjs, getCancellations, salirListaEspera, getListaEspera } from "../../controllers/reservas.controller.js"

export const reservasRouter = express.Router();

reservasRouter.get("/my-reservations", getMyReservations);
reservasRouter.get("/espera", getListaEspera);
reservasRouter.post("/cancelar-reserva", cancelarReservaRefactorizadoJsjs);
reservasRouter.get("/get-cancellations", getCancellations);
reservasRouter.post("/salir-lista-espera", salirListaEspera);