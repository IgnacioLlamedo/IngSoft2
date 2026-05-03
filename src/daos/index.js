import mongoose from "mongoose";
import config from "../config.js";
import { clienteDao as cliente } from "./cliente.dao.js";

await mongoose.connect(config.cnxStr)
console.log("Base de datos conectada")

export const clienteDao = new cliente()