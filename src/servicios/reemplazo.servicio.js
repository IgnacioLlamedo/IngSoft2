import { mailer } from "./mailer.servicio.js"
import { usuarioDao, claseGeneralDao, actividadDao } from "../daos/index.js";
import config from '../config.js';

//HAY QUE PROBAR ESTA -- probablemente clasesLiberadas no recibe lo correcto.
export async function notificarUsuario(idCandidato, clasesLiberadas, idCupo){
    try{

        console.log(" ")
        console.log(" ")
        console.log("Estos son los datos que llegaron a notificarUsuario: ");
        console.log(clasesLiberadas);
        console.log("Y el id de cupo es: ");
        console.log(idCupo);
        console.log(" ")
        console.log(" ")

        const usuario = await usuarioDao.readOne({ _id: idCandidato });

        if(!usuario){
            throw new Error("Usuario no encontrado.");
        }

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

        console.log(" ")
        console.log(" ")
        console.log("Estos son el dominio y el id del cupo a mandar al usuario a notificar por mail: ");
        console.log(dominio);
        console.log(idCupo);
        console.log(" ")
        console.log(" ")

        const mensaje = `
<p>Hola ${usuario.nombre}.</p>

<p>Se liberó un lugar en una clase a la que estabas en lista de espera.</p>

<p>
<b>Horario:</b> ${claseGeneral.dia}, a las ${claseGeneral.hora} hs.<br>
<b>Actividad:</b> ${actividad.nombre}.
</p>

<p>
<b>Fechas:</b><br>
${fechas.replace(/\n/g, "<br>")}
</p>

<p>
Para aceptar o rechazar ingresá a:<br>
${url}
</p>
`;

        //nosé si funciona así, corregime por Nacho
        await mailer.send(usuario.mail, "Lugar disponible", mensaje);

        return true;

    }
    catch(error){
        console.log(error);
        return false
    }
}