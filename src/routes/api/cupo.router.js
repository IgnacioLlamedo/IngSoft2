import express from "express";
import { getCupoData, createCupo, acceptCupo, rejectCupo  } from "../../controllers/cupo.controller.js";

export const cupoRouter = express.Router();


cupoRouter.get('/get', getCupoData);
cupoRouter.post('/create', createCupo);
cupoRouter.put('/accept', acceptCupo);
cupoRouter.put('/reject', rejectCupo);