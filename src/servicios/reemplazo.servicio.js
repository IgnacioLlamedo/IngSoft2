import { mailer } from "./mailer.servicio.js"
import { usuarioDao, claseGeneralDao, actividadDao } from "../daos/index.js";
import config from '../config.js';

//HAY QUE PROBAR ESTA -- probablemente clasesLiberadas no recibe lo correcto.
export async function notificarUsuario(idCandidato, clasesLiberadas, idCupo){
    try{

        console.log("Estos son los datos que llegaron a notificarUsuario: ");
        console.log(clasesLiberadas);
        console.log("Y el id de cupo es: ");
        console.log(idCupo);

        const usuario = await usuarioDao.readOne({ _id: idCandidato });

        if(!usuario){
            throw new Error("Usuario no encontrado.");
        }

        console.log(" ")
        console.log(" ")
        console.log("Los datos del usuario a notificar son: ")
        console.log(usuario);
        console.log(" ")
        console.log(" ")

        const fechas = clasesLiberadas
            .map(clase =>
                new Date(clase.fechaEspecifica).toLocaleDateString(
                    "es-AR",
                    {
                        day: "2-digit",
                        month: "2-digit",
                    }
                )
            )
            .join("\n");

        const claseGeneral = await claseGeneralDao.readOne({ _id: clasesLiberadas[0].idClaseGeneral })
        const actividad = await actividadDao.readOne({ _id: claseGeneral.idActividad });
        

        // Después cambiarlo por tu dominio real
        const dominio = config.link;
        const url = `https://${dominio}/cupo/?idCupo=${idCupo}`;

        const mensaje =
            `Hola ${usuario.nombre}.

            Se liberó un lugar en una clase a la que estabas en lista de espera.

            Horario: ${claseGeneral.dia}, a las ${claseGeneral.hora}hs
            
            Actividad: ${actividad.nombre}.

            Fechas: ${fechas}.

            Para aceptar o rechazar ingrese a: ${url}`;

        //nosé si funciona así, corregime por Nacho
        await mailer.send(usuario.mail, "Lugar disponible", mensaje);

        return true;

    }
    catch(error){
        console.log(error);
        return false
    }
}