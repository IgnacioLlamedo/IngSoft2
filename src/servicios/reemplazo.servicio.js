import { mailer } from "./mailer.servicio.js"

//HAY QUE PROBAR ESTA -- probablemente clasesLiberadas no recibe lo correcto.
export async function notificarUsuario(idCandidato, clasesLiberadas){
    try{
        const usuario = await usuarioDao.readOne({ _id: idCandidato });
        const nuevoCupo = await crearCupo(act.idUsuario, claseLiberada)

        if (!nuevoCupo){
            return false
        }
        if(!usuario){
            throw new Error("Usuario no encontrado.");
        }

        const idsClases = clasesLiberadas.map(
            clase => clase._id
        );

        // Después cambiarlo por tu dominio real
        const urlAceptar =
            `https://tudominio.com/api/reemplazos/aceptar/${nuevoCupo._id}`; //Mandar el id de reserva.

        const urlRechazar =
            `https://tudominio.com/api/reemplazos/rechazar/${idCandidato}`;

        const mensaje =
            `Hola ${usuario.nombre}.

            Se liberó un lugar en una clase a la que estabas en lista de espera.

            Clases: ${idsClases.join("\n")}

            Aceptar: ${urlAceptar}

            Rechazar: ${urlRechazar}

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