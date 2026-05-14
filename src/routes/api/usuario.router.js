import express from "express";
import { postController } from "../../controllers/usuario.controller.js";

export const usuarioRouter = express.Router()

usuarioRouter.post('/registro', postController)

/* usuarioRouter.post('/', postController)

usuarioRouter.get('/', getController)

usuarioRouter.get('/current', getCurrentController)

usuarioRouter.put('/', resetPassController)

usuarioRouter.delete('/:email', deleteController)

usuarioRouter.delete('/', deleteManyController)

usuarioRouter.put('/role/:email/:role', changeRoleController) */