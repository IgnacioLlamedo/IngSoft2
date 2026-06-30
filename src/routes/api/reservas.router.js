import express from "express";
<<<<<<< HEAD
import { getMyReservations, cancelarReservaRefactorizadoJsjs, getCancellations, salirListaEspera } from "../../controllers/reservas.controller.js"
=======
import { getMyReservations, cancelarReservaRefactorizadoJsjs, salirListaEspera, getCancellations } from "../../controllers/reservas.controller.js"
>>>>>>> origin/Front-Bauti2

export const reservasRouter = express.Router();

reservasRouter.get("/my-reservations", getMyReservations);
reservasRouter.post("/cancelar-reserva", cancelarReservaRefactorizadoJsjs);
reservasRouter.get("/get-cancellations", getCancellations);
reservasRouter.post("/salir-lista-espera", salirListaEspera);