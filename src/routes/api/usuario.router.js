import express from "express";
import { postController, loginController, logoutController, authenticationController } from "../../controllers/usuario.controller.js";

export const usuarioRouter = express.Router();

usuarioRouter.post('/register', postController);

usuarioRouter.post('/login', loginController);

usuarioRouter.post('/authenticate', authenticationController);

usuarioRouter.post('/logout', logoutController);

/* usuarioRouter.post('/', postController)

usuarioRouter.get('/', getController)

usuarioRouter.get('/current', getCurrentController)

usuarioRouter.put('/', resetPassController)

usuarioRouter.delete('/:email', deleteController)

usuarioRouter.delete('/', deleteManyController)

usuarioRouter.put('/role/:email/:role', changeRoleController) */