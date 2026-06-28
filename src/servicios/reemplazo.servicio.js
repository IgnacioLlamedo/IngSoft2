import { mailer } from "./mailer.servicio.js"
import config from '../config.js';

//HAY QUE PROBAR ESTA -- probablemente clasesLiberadas no recibe lo correcto.
export async function notificarUsuario(idCandidato, clasesLiberadas, idCupo){
    try{
        const usuario = await usuarioDao.readOne({ _id: idCandidato });

        if(!usuario){
            throw new Error("Usuario no encontrado.");
        }

        const idsClases = clasesLiberadas.map(
            clase => clase._id
        );

        // Después cambiarlo por tu dominio real
        const dominio = config.link;
        const url = `https://${dominio}/cupo/?idCupo=${idCupo}`;

        const mensaje =
            `Hola ${usuario.nombre}.

            Se liberó un lugar en una clase a la que estabas en lista de espera.

            Clases: ${idsClases.join("\n")}

            Para aceptar o rechazar ingrese a: ${url}

            Tenés 30 minutos para responder.`; //No me acuerdo cuanto era

        //nosé si funciona así, corregime por Nacho
        await mailer.send(usuario.email, "Lugar disponible", mensaje);

        return true;

    }
    catch(error){
        console.log(error);
        return false
    }
}