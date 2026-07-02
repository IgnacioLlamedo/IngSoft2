import express from "express";
import { actividadDao } from "../../daos/actividad.dao.js";

export const actividadRouter = express.Router();
const dao = new actividadDao();

// GET /api/actividad/get-all
actividadRouter.get("/get-all", async (req, res) => {
  try {
    const actividades = await dao.readMany({});
    res.json(actividades);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener actividades" });
  }
});

//export default actividadRouter;

