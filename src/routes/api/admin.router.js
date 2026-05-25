import express from "express";
import { crearActividad, crearProfesor, crearSala, crearSede, modificarActividad, modificarProfesor, modificarSala, modificarSede, eliminarActividad, eliminarProfesor, eliminarSala, eliminarSede } from "../../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post("/actividad", crearActividad)
adminRouter.put("/actividad", modificarActividad)
adminRouter.delete("/actividad", eliminarActividad)

adminRouter.post("/profesor", crearProfesor)
adminRouter.put("/profesor", modificarProfesor)
adminRouter.delete("/profesor", eliminarProfesor)

adminRouter.post("/sala", crearSala)
adminRouter.put("/sala", modificarSala)
adminRouter.delete("/sala", eliminarSala)

adminRouter.post("/sede", crearSede)
adminRouter.put("/sede", modificarSede)
adminRouter.delete("/sede", eliminarSede)