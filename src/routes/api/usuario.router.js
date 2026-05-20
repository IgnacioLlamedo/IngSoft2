import express from "express";
import { postController, loginController, logoutController, authenticationController, /*recuperarClases*/ } from "../../controllers/usuario.controller.js";
import { crearPreferencia } from "../../controllers/mercadoPago.controller.js";

export const usuarioRouter = express.Router();

usuarioRouter.post('/register', postController);

usuarioRouter.post('/login', loginController);

usuarioRouter.post('/authenticate', authenticationController);

usuarioRouter.post('/logout', logoutController);

usuarioRouter.post("/crear-preferencia", crearPreferencia);

//usuarioRouter.get("/clases", recuperarClases);


/* usuarioRouter.post('/', postController)

usuarioRouter.get('/', getController)

usuarioRouter.get('/current', getCurrentController)

usuarioRouter.put('/', resetPassController)

usuarioRouter.delete('/:email', deleteController)

usuarioRouter.delete('/', deleteManyController)

usuarioRouter.put('/role/:email/:role', changeRoleController) */