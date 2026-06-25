import { claseEspecificaDao, reservaDao, usuarioDao, cupoDao } from "../daos/index.js";
import { claseGeneralDao } from "../daos/index.js";
import { actividadDao } from "../daos/index.js";
import { salaDao } from "../daos/index.js";
import { profesorDao } from "../daos/index.js";
import { mailer } from "../servicios/mailer.servicio.js";
import { notificarUsuario } from "../servicios/reemplazo.servicio.js"

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
        /* console.log("Las reservas unicas y mensuales (Desde getMyReservations) del usuario son: ")
        console.log(reservas); */
        
        const reservasUnicasTotal = await reservaDao.populateUnica({ idUsuario: idUsuario })
        const reservasMensualesTotal = await reservaDao.populateMensual({ idUsuario: idUsuario })
        let reservasTotal = []
        reservasTotal = reservasTotal.concat(reservasUnicasTotal)
        reservasTotal = reservasTotal.concat(reservasMensualesTotal)

        /* console.log("Las reservas TOTALES del usuario son: ")
        console.log(reservasTotal);
        console.log("Las clases que pertenecen a la reserva son:")
        console.log(reservasTotal[0].clases); */
        
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

export async function cancelarReservaRefactorizadoJsjs(req, res) {
    try{
        const tipo = req.body.tipo;
        /**
         * Ejemplos:
         * 
         * Solo se cancelan clases de tipo única:
         * clases:
            Array(1)
                0: {clase: {{claseEspecifica}, llena: false}
         */
        const clase = req.body.clase;
        const user = req.session.user.id;
        console.log("Desde cancelarReserva Controller: ");
        console.log(tipo);
        console.log(clase);//cuidado, tiene idClase (que dentro tiene el idClaseEspecifica,
        //listados y todo lo de claseEspecifica)
        //y por otro lado tiene _id que no se que carajo es.

        //Marco en la lista de anotados en la posicion donde se encuentra
        //el usuario que cancelo la clase con estado "cancelado".
        const claseLiberada = await claseEspecificaDao.updateOne({ _id: clase.idClase._id,"anotados.idUsuario": user},
            {                                                       //el clase.idClase._id puede estar mal, revisar.
                $set:{
                "anotados.$.estado":"cancelado"
                }
        });

        console.log("/////////////////////////////////////");
        console.log("/////////////////////////////////////");

        //////////////////////////////////////////// Llega hasta acá el código. Lo siguiente hay que probarlo.....
       
        const reemplazado = await validarYNotificar(tipo, claseLiberada, user);

        //Si ningún usuario fue consultado para aceptar el cupo.
        if (!reemplazado){
            //elimino físicamente al usuario que cancelo la reserva.
            await eliminarDeClase(user, clase);

            /* ¿Debería hacer una lista de usuarios que cancelaron la reserva de una claseEspecifica?
            ¿o simplemente reviso las reservas de los usuarios? */
        }

        return res.json({
            success: true,
            message: "Reserva cancelada exitosamente"
        })
    }
    catch(error){
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}

export async function validarYNotificar(tipo, claseLiberada, idCancelo){

    let reemplazo = null;

    if (tipo === "Mensual"){
        let candidato;

        //CONSULTAR: Si una persona se baja de una lista de espera mensual, se baja de una clase sola
        //o de las 4/5 en las que está en lista de espera?
        
        for(const act in claseLiberada.esperaMensual){

            /**
             * validarReemplazo devuelve un elemento con esta forma:
             * 
             *  let valida = {
             *      clases: [],        --- clases tiene las 4/5 clases especificas
             *      candidatoValido: true
             *  }
             */
            candidato = await validarReemplazo(act.idUsuario, claseLiberada);

            /**Corroboro si el siguiente en lista de espera mensual
            puede acceder a la clase (Osea que las otras clases que corresponden
            a su reserva tengan espacio)
            Ya que puede darse la situación:
                clase1: espacio suficiente
                clase2: llena -- esta fue la reserva cancelada.
                clase3: llena
                clase4: llena
                
            y por lo tanto no sería elegible para reemplazo.*/

            //si es válido
            if (candidato.valido){

                const clasesDelCupo = [];
                for(const actual in candidato.clases){
                    const claseAct = {
                        clase: actual,
                        esLiberada: false
                    }
                    if (actual._id === claseLiberada._id){
                        claseAct.esLiberada = true;
                    }
                    clasesDelCupo.push(claseAct);
                }

                //creo el nuevo cupo
                const nuevoCupo = await await cupoDao.create({
                    idUsuario: act.idUsuario,
                    idUsuarioCanceloClase: idCancelo,
                    clasesEspecificas: clasesDelCupo,
                    tipo: tipo
                });

                if (!nuevoCupo){
                    console.log("error al crear cupo de reemplazo.");
                    break;
                }

                //consulto al usuario si acepta el nuevo cupo.
                reemplazo = await notificarUsuario(act.idUsuario, candidato.clases, nuevoCupo._id);
                break;
            }
            //si no sirve sigo recorriendo.
        }
    }
    //la clase cancelada es única -- simplemente busco al siguiente en
    //lista de espera única
    else{
        if (claseLiberada.esperaUnica.length > 0){
            for(const unicaAct in claseLiberada.esperaUnica){
                //si el actual aún no fue consultado, aceptó o rechazo un cupo, creo el cupo y lo consulto.
                if (unicaAct.estado === 'activo') {
                    
                    const nuevoCupo = await cupoDao.create({
                        idUsuario: unicaAct.idUsuario,
                        idUsuarioCanceloClase: idCancelo,
                        clasesEspecificas: claseLiberada,
                        tipo: tipo
                    });
                    
                    await claseEspecificaDao.updateOne({_id: claseLiberada._id, "anotados.idUsuario": unicaAct.idUsuario},
                    { 
                        $set:{
                            "anotados.$.estado":"esperandoConfirmacion"
                        }
                    })

                    reemplazo = await notificarUsuario(unicaAct.idUsuario, claseLiberada, nuevoCupo._id);
                }
                else
                    continue
            }

            //solicito confirmación por parte del usuario
            
        }
    }
    return reemplazo;
}

//Pasar esta funcióin a reemplazo.servicio.js
//también la voy a utilizar con cron.
async function validarReemplazo(candidato, clase){

    //Ahora esta función solo se utiliza si la clase cancelada es de tipo
    //UNICA!
    console.log("Dentro de validar reemplazo: ");
    console.log("El candidato es el: ")
    console.log(candidato);
    console.log("&&&&&&&&&&&&&&&&&");
    console.log("El tipo de reemplazo que se verificará siempre será UNICO ")
    console.log("Las clases a validar son: ")
    console.log(clase);
    console.log("&&&&&&&&&&&&&&&&&");
    console.log("&&&&&&&&&&&&&&&&&");
    
    let reserva = null;
   
    //paso 1: Obtener la reserva del candidato a la que pertenece la clase.
    reserva = reservaDao.readOne({ idUsuario: candidato.idUsuario,
        cancelada: false,
        tipo: 'mensual',
        clases: {
            $elemMatch: {
                idClase: clase._id //Probar esto
            }
        },
    });

    let valida = {
        clases: [],
        candidatoValido: true
    }

    //paso 2: iterar las clases de la reserva
    if(!reserva){
        return false;
    }
    else{
        const claseGeneral = await claseGeneralDao.readOne({ _id: reserva.clases[0].idClaseGeneral })

        //revisar si todas las clases tienen espacio para anotar al usuario.
        for(const claseAct in reserva.clases){
            const especificaAct = await claseEspecificaDao.readOne({ idClase: claseAct.idClase });

            if(!especificaAct){ //En teoría no debería ocurrir a menos que modifiquemos la DB
                valida.candidatoValido = false;
                console.log("Esto es validarReemplazo linea 285 algun moco te mandaste flaco.")
                break;
            }

            const hayCancelado = especificaAct.anotados.some(
                c => c.estado === 'cancelado'
            )

            //La clase no va a ser válida si la clase está llena y no hay un usuario que haya cancelado
            if (especificaAct.anotados.length === claseGeneral.limiteClase){
                /**
                 * Separo los ifs porque puede darse el caso en el que haya cancelados y la clase no esté llena.
                 * De todas formas al devolver al siguiente en lista de espera (este usuario) como válido,
                 * se reemplazará al usuario con estado cancelado.
                 */
                if (!hayCancelado){
                    valida.candidatoValido = false;
                    break;
                }
            }
            valida.clases.push(especificaAct);
        }
    }

    return valida;
}

/**
 * Función que elimina el usuario en caso de que no exista ningún usuario válido
 * O, el candidato rechace (o se venca el tiempo límite.) la clase.
 */
async function eliminarDeClase(clase, user){
    console.log("Dentro de eliminarDeClase");
    console.log(clase);
    const updateado = await claseEspecificaDao.updateOne(
        { _id: clase._id },
        {
            $pull: {
                anotados: {
                    idUsuario: user
                }
            } 
        }
    )
}

export async function reemplazarAnotado(clase, usuario){
    console.log("Dentro de reemplazar anotado");
    console.log(clase);
    const updateado = await claseEspecificaDao.updateOne(
        { _id: clase._id },
        {
            $pull: {
                anotados: {
                    idUsuario: user
                }
            } 
        }
    )
}

//////////////////// Acá estaba lo viejo

//Unir reservaUnica y mensual. separar por if
export async function postReservaUnica(req, res) {
    try {
        const reservaData = req.body;
        
        const idClaseGeneral = reservaData.clases[0].idClase;
        const fecha = reservaData.clases[0].fecha;

        //Creo el objeto a anotar.
        const usuarioData = {
            idUsuario: reservaData.idUsuario,
            tipo: "unico"
        };

        //Tengo que crear una fecha y setear los segundos a 0 porque mongo los guarda con ese formato.
        const fechaBuscada = new Date(fecha);

        fechaBuscada.setSeconds(0, 0);
        
        const claseGeneral = await claseGeneralDao.readOne({ _id: idClaseGeneral })
        let claseEspecifica = await claseEspecificaDao.readOne({ idClaseGeneral: claseGeneral._id,
            fechaEspecifica: fechaBuscada })
        if (!claseEspecifica) {
            console.log("Desde postReservaUnica, creando clase especifica y agregando a lista de anotados...");
            //Creo la clase especifica con el usuario anotado.
            const data = {
                idClaseGeneral: claseGeneral._id,         
                fechaEspecifica: fecha,
                anotados: [usuarioData],
                esperaUnica: [],
                esperaMensual: [],
            };

            //Crea la clase especifica y asigna la nueva id, luego crea la reserva
            claseEspecifica = await claseEspecificaDao.create(data);
            reservaData.idClaseEspecifica = claseEspecifica._id;
            await reservaDao.createUnica(reservaData);

            return res.json({
                success: true,
                message: "Usuario anotado",
                enEspera: false
            });
        }
        const capacidadActual = claseEspecifica.anotados.length;

        //Asigno el idClaseEspecifica
        reservaData.idClaseEspecifica = claseEspecifica._id;

        //Si hay lugar lo agrego al arreglo de anotados.
        if (capacidadActual < claseGeneral.limiteClase) {
            console.log("Hay lugar en la clase para anotarse -> anotando en lista de anotados...");
            await claseEspecificaDao.updateOne(
                { _id: claseEspecifica._id },
                {
                    $push: {
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
            clases: pagoData.clases, //Contiene la idClaseGeneral y FechasEspecificas (DE 4 CLASES!)
            pagos: [{ idPago: pagoData._id }],
            idUsuario: pagoData.idUsuario,
            tipoClase: "mensualidad"
        */
        const reservaData = req.body;

        /* console.log("(Back) - Datos recibidos en postReservaUnica:");
        console.log(reservaData); */

        const usuarioData = {
            idUsuario: reservaData.idUsuario,
            tipo: reservaData.tipoClase
        };

        const clasesReserva = [];


        /**
         * 
         * Esto está mal, voy a modificarlo para que primero se consigan
         * 
         */
        //Itero sobre las 4 clases buscando si la claseEspecifica existe, creandola si no es el caso 
        for (const claseData of reservaData.clases) {

            const idClaseGeneral = claseData.idClase;
            const fecha = claseData.fecha;

            const fechaBuscada = new Date(fecha);
            fechaBuscada.setSeconds(0, 0);

            let claseEspecifica = await claseEspecificaDao.readOne({ idClaseGeneral: idClaseGeneral, fechaEspecifica: fechaBuscada });

            /* console.log("Clase específica encontrada con el idGeneral " + idClaseGeneral + " y fechaEspecifica " + fechaBuscada + " es: ");
            console.log(claseEspecifica); */

            const claseGeneral = await claseGeneralDao.readOne({ _id: idClaseGeneral});

            if (!claseEspecifica) {

                console.log("No existe clase específica --- se crea");

                const data = {
                    idClaseGeneral: claseGeneral._id,
                    fechaEspecifica: fecha,
                    anotados: [usuarioData],
                    esperaUnica: [],
                    esperaMensual: []
                };

                claseEspecifica = await claseEspecificaDao.create(data);

                
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
            /**
             * Si la lista está llena debo consultar primero
             * Por lo tanto devuelvo falso?
             */
            else{
                //Despues veo que se tiene que hacer acá.
            }
        }

        console.log("Estas son las clases que se cargarán al crear la reserva mensual: ")
        console.log(clasesReserva);
        //Por alguna razón, al pushear un idClase, también se creaba un _id para esa idClase especifica.

        // Crear reserva
        await reservaDao.createMensual({
            clases: clasesReserva,
            pagos: reservaData.pagos,
            idUsuario: reservaData.idUsuario,
            cancelada: false
        });

        return res.json({
            success: true,
            message: "Reserva mensual procesada"
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