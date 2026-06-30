import express from "express";
<<<<<<< HEAD
import { crearPreferencia, confirmarPagoController, consultar, getPaymentsController, obtenerPago } from "../../controllers/mercadoPago.controller.js";

=======
import { crearPreferencia, confirmarPagoController, consultar, getPaymentsController, getUserPaymentsController } from "../../controllers/mercadoPago.controller.js";
>>>>>>> origin/Front-Bauti2

export const pagoRouter = express.Router();

pagoRouter.post("/crear-preferencia", crearPreferencia);
pagoRouter.post("/consultar-pago", consultar);
pagoRouter.post("/confirmarPago", confirmarPagoController);
pagoRouter.get("/get-payments", getPaymentsController);
<<<<<<< HEAD
//pagoRouter.post("/webhook", webhookPago);
pagoRouter.get("/get-pago/:idPagoPendiente", obtenerPago);
=======
pagoRouter.get("/get-user-payments", getUserPaymentsController);
>>>>>>> origin/Front-Bauti2
//, obtenerClaseGeneral
/* pagoRouter.post("/obtenerClaseGeneral", obtenerClaseGeneral); */
