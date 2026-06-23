import cron from "node-cron";
import { revisarCandidatos } from './reemplazo.servicio.js';

class CronService{
    iniciar(){

        //cada 1 minuto ejecutará revisar candidatos.
        cron.schedule('* * * * *', async () => {

            try{
                await revisarCandidatos();
            }
            catch(error){
                console.error('Error revisando candidatos:', error);
            }
        });

        console.log("Cron activo.")
    }
}

export const cronService = new CronService();