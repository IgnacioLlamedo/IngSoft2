import { claseEspecificaDao, reservaDao } from "../daos/index.js";
import { claseGeneralDao } from "../daos/index.js";
import { actividadDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";


/* export async function getMyReservations(req, res) {
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
        const reservasUnicas = await reservaDao.readManyUnica({
            idUsuario,
            cancelada: false
        });

        const reservasMensuales = await reservaDao.readManyMensual({
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
        
        const reservas = [
            ...reservasUnicas,
            ...reservasMensuales
        ];
        console.log("Las reservas unicas y mensuales del usuario son: ")
        console.log(reservas);

        /* Esto estaria bueno modificarlo porque se traen todas las clases,
        actividades, salas y profesores.
        Y a partir de ahí se filtran segun las reservas que tiene el usuario.
        Según consulté con IA, se puede hacer con populate (ni me gaste xd)
        const clases = await claseGeneralDao.readMany({});
        const actividades = await actividadDao.readMany({});
        const salas = await salaDao.readMany({});
        const profesores = await profesorDao.readMany({});

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
            Al eliminar el hard, se puede quitar
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
} */

export async function getMyReservations(req, res) {
    try {

        if(!req.session.user) {
            return res.json({
                success: false,
                message: "usuario no autenticado."
            });
        }

        const idUsuario = req.session.user.id;
        /* console.log("Id de usuario desde reservas.controller: ");
        console.log(idUsuario); */

        //Obtengo las reservas de clases únicas y mensuales del usuario
        const reservasUnicas = await reservaDao.readManyUnica({
            idUsuario,
            cancelada: false
        });

        const reservasMensuales = await reservaDao.readManyMensual({
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
        /* console.log("Las reservas unicas y mensuales del usuario son: ")
        console.log(reservas); */

        /* Esto estaria bueno modificarlo porque se traen todas las clases,
        actividades, salas y profesores.
        Y a partir de ahí se filtran segun las reservas que tiene el usuario.
        Según consulté con IA, se puede hacer con populate (ni me gaste xd) */

        //Sin populate
        /* const clases = await claseGeneralDao.readMany({});
        const actividades = await actividadDao.readMany({});
        const salas = await salaDao.readMany({});
        const profesores = await profesorDao.readMany({});

        const reservasTotal = reservas.map(reserva => {

            //SQL joins intensifies :v
            const clase = clases.find(
                c => c._id === reserva.idClase
            );
            console.log("Una clase dentro de reserva es: ");
            console.log(clase); //si retorna undefined es porque el idClase
            //en reserva estaba hardcodeado y no existe una clase con ese id.

            //Esto realmente es por temas de testeo, ya que en las reservas, las id de clase están hardcodeadas y al buscar la clase, devuelve undefined. Al eliminar el hard, se puede quitar 
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
            
        }).filter(Boolean); //Filtra los null */
        
        const reservasUnicasTotal = await reservaDao.populateUnica({ idUsuario: idUsuario })
        const reservasMensualesTotal = await reservaDao.populateMensual({ idUsuario: idUsuario })
        let reservasTotal = []
        reservasTotal = reservasTotal.concat(reservasUnicasTotal)
        reservasTotal = reservasTotal.concat(reservasMensualesTotal)

        /* console.log("Las reservas TOTALES del usuario son: ")
        console.log(reservasTotal); */
        
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

//Unir reservaUnica y mensual. separar por if
export async function postReservaUnica(req, res) {
    try {
        const reservaData = req.body;

        /* console.log("(Back) - Datos recibidos en postReservaUnica -> desde paymentApproved.js: ");
        console.log(reservaData); */
        
        const idClaseGeneral = reservaData.clases[0].idClase;
        const fecha = reservaData.clases[0].fecha;
/*         console.log("La fecha recibida es: " + fecha);
        console.log("La fecha es de typeOF -> " + typeof(fecha)); */

        //Creo el objeto a anotar.
        const usuarioData = {
            idUsuario: reservaData.idUsuario,
            tipo: "unico"
        };

        //Tengo que crear una fecha y setear los segundos a 0 porque mongo los guarda con ese formato.
        const fechaBuscada = new Date(fecha);

        fechaBuscada.setSeconds(0, 0);
        
        const claseGeneral = await claseGeneralDao.readOne({ _id: idClaseGeneral })
/*         console.log("la clase general encontrada con el id " + idClaseGeneral + " es: ");
        console.log(claseGeneral); */
        let claseEspecifica = await claseEspecificaDao.readOne({ idClaseGeneral: claseGeneral._id,
            fechaEspecifica: fechaBuscada })
        /* console.log("La clase especifica encontrada segun el idGeneral " + idClaseGeneral + " y la fecha especifica " + fecha + " es: ");
        console.log(claseEspecifica); */
        if (!claseEspecifica) {
            console.log("No existeclase especifica (desde postReservaUnica)");
            //Creo la clase especifica con el usuario anotado.
            const data = {
                idClaseGeneral: claseGeneral._id,         
                fechaEspecifica: fecha,
                anotados: [usuarioData],
                espera: [],
            };

            //Crea la clase especifica y asigna la nueva id, luego crea la reserva
            claseEspecifica = await claseEspecificaDao.create(data);
            reservaData.idClaseEspecifica = claseEspecifica._id;
            await reservaDao.createUnica(reservaData);

            return res.json({
                success: true,
                message: "Usuario anotado",
                enEspera: false             //Para avisar
            });
        }
        
        //console.log("Existe clase específica (desde postReservaUnica)");
        //Verifico si el usuario está anotado o en espera
        

        //console.log("Ya se checkeo que el usuario no este en lista de espera o anotados, ahora, a que lista se anotará? ");
        //Si existe entonces -> Checkeo capacidad
        const capacidadActual = claseEspecifica.anotados.length;
//En el caso de la mensual, hay que revisar que las 4 clases tengan espacio de reserva.


        //Asigno el idClaseEspecifica
        reservaData.idClaseEspecifica = claseEspecifica._id;

        //Si hay lugar lo agrego al arreglo de anotados.
        if (capacidadActual < claseGeneral.limiteClase) {
            console.log("Hay lugar en la clase para anotarse -> pasa a lista de anotados.");
            await claseEspecificaDao.updateOne(
                { _id: claseEspecifica._id },
                {
                    $push: {    //No sabia que se podia hacer esto jsjs, igual hay que probarlo
                        anotados: usuarioData
                    }
                }
            );
            await reservaDao.createUnica(reservaData);

            return res.json({
                success: true,
                message: "Clase específica creada. Usuario anotado",
                enEspera: false
            });
        }   

       //console.log("NO hay lugar en la clase para anotarse -> pasa a lista de ESPERA.");
        // Si NO hay lugar -> agrego al arreglo de espera.
        await claseEspecificaDao.updateOne(
                { _id: claseEspecifica._id },
                {
                    $push: {
                        espera: usuarioData
                    }
                }
            );

        return res.json({
            success: true,
            message: "Usuario agregado a lista de espera",
            enEspera: true
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

        /* Esto contiene el req.body: 
            clases: pagoData.clases, //Contiene la idClaseGeneral y FechasEspecificas
            pagos: [{ idPago: pagoData._id }],
            idUsuario: pagoData.idUsuario,
            tipoClase: "mensualidad" */
        const reservaData = req.body;

        /* console.log("(Back) - Datos recibidos en postReservaUnica:");
        console.log(reservaData); */

        const usuarioData = {
            idUsuario: reservaData.idUsuario,
            tipo: reservaData.tipoClase
        };

        const clasesReserva = [];
        //Itero sobre las 4 clases buscando si la claseEspecifica existe, creandola si no es el caso 
        for (const claseData of reservaData.clases) {

            const idClaseGeneral = claseData.idClase;
            const fecha = claseData.fecha;

            const fechaBuscada = new Date(fecha);
            fechaBuscada.setSeconds(0, 0);

            const claseGeneral = await claseGeneralDao.readOne({
                _id: idClaseGeneral
            });

            let claseEspecifica = await claseEspecificaDao.readOne({
                idClaseGeneral: claseGeneral._id,
                fechaEspecifica: fechaBuscada
            });

            /* console.log("Clase específica encontrada con el idGeneral " + idClaseGeneral + " y fechaEspecifica " + fechaBuscada + " es: ");
            console.log(claseEspecifica); */

            if (!claseEspecifica) {

                console.log("No existe clase específica se crea");

                const data = {
                    idClaseGeneral: claseGeneral._id,
                    fechaEspecifica: fecha,
                    anotados: [usuarioData],
                    espera: []
                };

                claseEspecifica = await claseEspecificaDao.create(data);

                // Crear reserva
                clasesReserva.push({
                    idClase: claseEspecifica._id
                });

                continue;
            }

            //Existe la clase específica, controlar donde se guardará el usuario (anotados o espera)
            const capacidadActual = claseEspecifica.anotados.length;

            if (capacidadActual < claseGeneral.limiteClase) {

                console.log("Hay lugar, por lo tanto se carga en anotados");

                await claseEspecificaDao.updateOne(
                    { _id: claseEspecifica._id },
                    {
                        $push: {
                            anotados: usuarioData
                        }
                    }
                );
   
                clasesReserva.push({
                    idClase: claseEspecifica._id
                });

                continue;
            }

            //console.log("Sin lugar por lo tanto a la cola de espera");

            await claseEspecificaDao.updateOne(
                { _id: claseEspecifica._id },
                {
                    $push: {
                        espera: usuarioData
                    }
                }
            );

            return res.json({
                success: true,
                message: "Reserva mensual procesada"
            });
        }
        await reservaDao.createMensual({
            clases: clasesReserva,
            pagos: reservaData.pagos,
            idUsuario: reservaData.idUsuario,
            cancelada: false
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

