import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";
import { testRouter } from "./test.router.js";
import { clasesRouter } from "./clases.router.js";
import { pagoRouter } from "./pago.router.js";
import { adminRouter } from "./admin.router.js";
import { reservasRouter } from "./reservas.router.js"
import { asistenciaRouter } from "./asistencia.router.js"
import { cupoRouter } from "./cupo.router.js";
import { webhookRouter } from "./webhook.router.js";
import { actividadRouter } from "./actividad.router.js";


export const apiRouter = Router()

apiRouter.use('/webhook', webhookRouter);
apiRouter.use(json());


apiRouter.use("/actividad", actividadRouter);

apiRouter.use('/clases', clasesRouter)
apiRouter.use('/pago', pagoRouter);
apiRouter.use('/admin', adminRouter)
apiRouter.use('/reservas', reservasRouter);
apiRouter.use('/asistencia', asistenciaRouter);
apiRouter.use('/cupo', cupoRouter);

apiRouter.use('/', usuarioRouter);



apiRouter.use('/test', testRouter);