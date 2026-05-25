import express from "express";
import { getMyReservations } from "../../controllers/reservas.controller.js"

export const reservasRouter = express.Router();

reservasRouter.get("/my-reservations", getMyReservations);