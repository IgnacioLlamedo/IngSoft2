import { Router, json } from "express";
import { usuarioRouter } from "./usuario.router.js";

export const apiRouter = Router()

apiRouter.use(json())
apiRouter.use('/', usuarioRouter)