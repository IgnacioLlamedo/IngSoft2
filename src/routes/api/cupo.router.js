import express from "express";
import { getCupoData, createCupo, rejectCupo } from "../../controllers/cupo.controller.js";

export const cupoRouter = express.Router();


cupoRouter.get('/get', getCupoData);
cupoRouter.post('/create', createCupo);
cupoRouter.put('/reject', rejectCupo);