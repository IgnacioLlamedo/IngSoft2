import mongoose from "mongoose";
import config from "../config.js";

await mongoose.connect(config.cnxStr)
console.log("Base de datos conectada")
