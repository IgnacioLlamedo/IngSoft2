import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";
import { testRouter } from "./test.router.js";
import { clasesRouter } from "./clases.router.js";
import { pagoRouter } from "./pago.router.js";


export const apiRouter = Router()

apiRouter.use(json());
apiRouter.use('/', usuarioRouter);
apiRouter.use('/clases', clasesRouter)
apiRouter.use('/pago', pagoRouter);


apiRouter.use('/test', testRouter);