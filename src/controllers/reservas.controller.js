import { reservaDao } from "../daos/reserva.dao.js";
import { claseDao } from "../daos/clase.dao.js";
import { actividadDao } from "../daos/actividad.dao.js";
import { salaDao } from "../daos/sala.dao.js";
import { profesorDao } from "../daos/profesor.dao.js";

const reservaDAO = new reservaDao();
const claseDAO = new claseDao();
const actividadDAO = new actividadDao();
const salaDAO = new salaDao();
const profesorDAO = new profesorDao();

export async function getMyReservations(req, res) {
    try {

        if(!req.session.user) {
            return res.json({
                success: false,
                message: "usuario no autenticado."
            });
        }

        const idUsuario = req.session.user.id;
        console.log("Id de usuario desde reservas.controller: ");
        console.log(idUsuario);

        //Obtengo las reservas de clases únicas y mensuales del usuario
        const reservasUnicas = await reservaDAO.readManyUnica({
            idUsuario,
            cancelada: false
        });

        const reservasMensuales = await reservaDAO.readManyMensual({
            idUsuario,
            cancelada: false
        });

        //Desarmar los arrays obtenidos (se unen las unicas y mensuales)
        /**
         * Queda algo como:
         * [
            reservaUnica1,
            reservaUnica2,
            reservaMensual1
            ]
         */
        const reservas = [
            ...reservasUnicas,
            ...reservasMensuales
        ];
        console.log("Las reservas unicas y mensuales del usuario son: ")
        console.log(reservas);

        /* Esto estaria bueno modificarlo porque se traen todas las clases,
        actividades, salas y profesores.
        Y a partir de ahí se filtran segun las reservas que tiene el usuario.
        Según consulté con IA, se puede hacer con populate (ni me gaste xd) */
        const clases = await claseDAO.readMany({});
        const actividades = await actividadDAO.readMany({});
        const salas = await salaDAO.readMany({});
        const profesores = await profesorDAO.readMany({});

        const reservasTotal = reservas.map(reserva => {

            //SQL joins intensifies :v
            const clase = clases.find(
                c => c._id === reserva.idClase
            );
            console.log("Una clase dentro de reserva es: ");
            console.log(clase); //si retorna undefined es porque el idClase
            //en reserva estaba hardcodeado y no existe una clase con ese id.

            /* Esto realmente es por temas de testeo,
            ya que en las reservas, las id de clase están hardcodeadas
            y al buscar la clase, devuelve undefined.
            Al eliminar el hard, se puede quitar */ 
            if (!clase) {
                return null;
            }

            const actividad = actividades.find(
                a => a._id === clase.idActividad
            );

            const sala = salas.find(
                s => s._id === clase.idSala
            );

            const profesor = profesores.find(
                p => p._id === clase.idProfesor
            );

            console.log("Información de las reservas del usuario: ");
            console.log(clase, actividad, sala, profesor);

            return {
                reserva,
                clase,
                actividad,
                sala,
                profesor
            };
            
        }).filter(Boolean); //Filtra los null

        res.json({
            success: true,
            reservas: reservasTotal
        });

    }
    catch(error) {
        console.log(error);

        res.json({
            success: false,
            message: error.message
        });
    }
}

export async function postReservaUnica(req, res) {
    try {
        const reservaData = req.body;

        /* console.log("Datos recibidos (Back) en postReservaUnica : ");
        console.log(reservaData); */

        await reservaDAO.createUnica(reservaData);

        res.json({
            success: true
        });
    }
    catch(error) {
        console.log(error)
        res.json({
            success: false,
            message: error,
        });
    }
}

/**
 * El postReservaMensual debe consultar primero si el usuario ya tiene esa clase reservada
 * en caso de tener una reserva a esa clase ya hecha, solo se debe hacer update de pagos 
 * (agregando el pago hecho), fecha (agregando la fecha específica del pago supongo) y 
 * fecha de vencimiento aumentando 1 mes la fecha de vencimiento.
 */
export async function postReservaMensual(req, res) {
    try {
        const reservaData = req.body.reservaData;
        await reservaDAO.createMensual(reservaData);

        res.json({
            success: true,
        });
    }
    catch(error) {
        console.log(error)
        res.json({
            success: false,
            message: error,
        });
    }
}

