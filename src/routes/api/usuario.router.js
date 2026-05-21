import express from "express";
import { postController, loginController, logoutController, authenticationController, crearCodigo, authPass, resetPass, loadProfileController, saveProfileController, checkPasswordController, setPasswordController } from "../../controllers/usuario.controller.js";

export const usuarioRouter = express.Router();

usuarioRouter.post('/register', postController);

usuarioRouter.post('/login', loginController);

usuarioRouter.post('/authentication', authenticationController);

usuarioRouter.put('/authentication', crearCodigo)

usuarioRouter.post('/logout', logoutController);

usuarioRouter.get('/load-profile', loadProfileController);

usuarioRouter.post('/save-profile', saveProfileController);

usuarioRouter.post('/check-password', checkPasswordController);

usuarioRouter.post('/set-password', setPasswordController);

usuarioRouter.post('/resetpass', crearCodigo)

usuarioRouter.post('/authPass', authPass)

usuarioRouter.put('/resetpass', resetPass)

/* usuarioRouter.post('/', postController)

usuarioRouter.get('/', getController)

usuarioRouter.get('/current', getCurrentController)

usuarioRouter.put('/', resetPassController)

usuarioRouter.delete('/:email', deleteController)

usuarioRouter.delete('/', deleteManyController)

usuarioRouter.put('/role/:email/:role', changeRoleController) */