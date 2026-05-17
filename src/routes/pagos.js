import express from "express";
import { crearPreferencia } from "../controllers/pagosController.js";

const router = express.Router();

router.post("/crear-preferencia", crearPreferencia);

export default router;