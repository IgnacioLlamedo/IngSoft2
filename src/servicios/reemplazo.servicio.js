import { listaCandidatosDao } from "../daos/index.js";
import { mailer } from "./mailer.servicio.js"

export async function revisarCandidatos(){

    console.log("Revisando lista de candidatos...")
    const ahora = new Date();

    //consigue todas las listas de candidatos.
    const listas = await listaCandidatosDao.readMany({ 
        estado:'pendiente',
        fechaLimite:{
            $lte: ahora
        }
    });

    for(const lista of listas){
        await pasarAlSiguiente(lista);
    }
}

export async function pasarAlSiguiente(lista){

    const siguienteIndice = lista.candidatoActual + 1;

    if (siguienteIndice >= lista.candidatos.length){

        await listaCandidatosDao.updateOne(
            { _id: lista._id },
            { estado:'sin_candidatos' }
        );

        return;
    }

    //seguramente hay que modificar el tiempo de espera.
    const fechaLimite = new Date(Date.now() + 30*60*1000);

    await listaCandidatosDao.updateOne(
        { _id: lista._id },
        {
            candidatoActual: siguienteIndice,
            fechaLimite: fechaLimite
        }
    );
    const siguiente = lista.candidatos[siguienteIndice];

    await notificarUsuario(siguiente, lista._id);
}

//HAY QUE PROBAR ESTA -- probablemente clasesLiberadas no recibe lo correcto.
export async function notificarUsuario(idCandidato, clasesLiberadas){
    const usuario = await usuarioDao.readOne({ _id: idCandidato });

    if(!usuario){
        throw new Error("Usuario no encontrado.");
    }

    const idsClases = clasesLiberadas.map(
        clase => clase._id
    );

    // Después cambiarlo por tu dominio real
    const urlAceptar =
        `https://tudominio.com/api/reemplazos/aceptar/${idCandidato}`;

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