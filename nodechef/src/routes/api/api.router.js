import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";
import { testRouter } from "./test.router.js";

export const apiRouter = Router()

apiRouter.use(json());
apiRouter.use('/', usuarioRouter);


apiRouter.use('/test', testRouter);