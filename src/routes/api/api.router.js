import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";
import { testRouter } from "./test.router.js";
import { clasesRouter } from "./clases.router.js";
import { pagoRouter } from "./pago.router.js";
import { adminRouter } from "./admin.router.js";
import { reservasRouter } from "./reservas.router.js"


export const apiRouter = Router()

apiRouter.use(json());
apiRouter.use('/', usuarioRouter);
apiRouter.use('/clases', clasesRouter)
apiRouter.use('/pago', pagoRouter);
apiRouter.use('/admin', adminRouter)
apiRouter.use('/reservas', reservasRouter);

apiRouter.use('/test', testRouter);