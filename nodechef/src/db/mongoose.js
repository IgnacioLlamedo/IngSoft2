import mongoose from "mongoose";

export async function conectarMongo() {
    try {
        
        await mongoose.connect(process.env.MONGO_CNX_STR);
        console.log("Conectado correctamente a MongoDB");

    } catch(error) {
        console.error("Error conectando MongoDB:", error);
    }
}