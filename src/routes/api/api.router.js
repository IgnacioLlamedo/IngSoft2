import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";
import { testRouter } from "./test.router.js";
import { paymentRouter } from "./payment.j.routers.js";

export const apiRouter = Router()

apiRouter.use(json());
apiRouter.use('/', usuarioRouter);
apiRouter.use('/payment', paymentRouter);


apiRouter.use('/test', testRouter);