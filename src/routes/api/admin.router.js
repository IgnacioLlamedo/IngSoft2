import express from "express";
import { crearActividad, crearProfesor, crearSala, crearSede, modificarActividad, modificarProfesor, modificarSala, modificarSede, eliminarActividad, eliminarProfesor, eliminarSala, eliminarSede, getActivities, getInstructors, getRooms, getFacilities, inhabilitarProfesor, getActivitiesStats, actualizarDiasAviso, recuperarDiasAviso } from "../../controllers/admin.controller.js";

export const adminRouter = express.Router();

adminRouter.post("/actividad", crearActividad)
adminRouter.put("/actividad", modificarActividad)
adminRouter.delete("/actividad", eliminarActividad)
adminRouter.get("/actividad", getActivities)
adminRouter.get("/activities-stats", getActivitiesStats)

adminRouter.post("/profesor", crearProfesor)
adminRouter.put("/profesor", modificarProfesor)
adminRouter.delete("/profesor", eliminarProfesor)
adminRouter.get("/profesor", getInstructors)
adminRouter.put("/profesor/inhabilitar", inhabilitarProfesor)

adminRouter.post("/sala", crearSala)
adminRouter.put("/sala", modificarSala)
adminRouter.delete("/sala", eliminarSala)
adminRouter.get("/sala", getRooms)

adminRouter.post("/sede", crearSede)
adminRouter.put("/sede", modificarSede)
adminRouter.delete("/sede", eliminarSede)
adminRouter.get("/sede", getFacilities)

adminRouter.put("/diasaviso", actualizarDiasAviso)
adminRouter.get("/diasaviso", recuperarDiasAviso)