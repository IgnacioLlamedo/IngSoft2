import express from "express";
import { getMyReservations, cancelarReservaRefactorizadoJsjs } from "../../controllers/reservas.controller.js"

export const reservasRouter = express.Router();

reservasRouter.get("/my-reservations", getMyReservations);
reservasRouter.post("/cancelar-reserva", cancelarReservaRefactorizadoJsjs);