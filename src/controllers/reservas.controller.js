import { claseEspecificaDao, reservaDao, usuarioDao } from "../daos/index.js";
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
         * Si tipo es única:
         * clases:
            Array(1)
                0: {clase: {…}, llena: false}

        Si tipo es mensual:
         * clases: 
            Array(4)
                0: {clase: {…}, llena: false}
                1: {clase: null, llena: false}
                2: {clase: {…}, llena: true}
                3: {clase: null, llena: false}
         */
        const clases = req.body.clase;
        const user = req.session.user.id;
        console.log("Desde cancelarReserva Controller: ");
        console.log(tipo);
        console.log(clases);//cuidado, tiene idClase (que dentro tiene el idClaseEspecifica,
        //listados y todo lo de claseEspecifica)
        //y por otro lado tiene _id que no se que carajo es.

        //Itera sobre las clasesEspecificas recibidas cambiando el estado de la
        //lista de anotados a cancelado en el idUsuario que canceló.
        const clasesLiberadas = await cancelarClases(clases, user); 

        console.log("/////////////////////////////////////");
        console.log("/////////////////////////////////////");


////////////////////////////////////////////
        // Llega hasta acá el código.
        let reemplazo = null;

        const candidatosUnicos = await obtenerCandidatosUnicos(clases);
        
        console.log("El tipo de la clase cancelada era ((((UNICO)))), por lo tanto busco un candidato único: ");
        console.log("Estos son los candidatos únicos obtenidos: ");

        for(const candidato of candidatosUnicos){
            console.log(candidato);
            console.log("%%%%%%%%%%%%%%%%%%%%%%%%")
        }
        reemplazo = await procesarCandidatos(candidatosUnicos, clases, user, tipo);

        //Si ningún candidato sirvio o aceptó la clase, se elimina de la
        //lista de anotados al usuario que canceló
        if (!reemplazo){
            console.log("ningún candidato era válido para reemplazar al usuario que cancelo la reserva, POR LO TANTO ELIMINO AL USUARIO DE LA LISTA DE ANOTADOS. ")
            await eliminarDeClase(clases, user);
        }
        else{
            //reemplazo al usuario con estado "cancelado" en la lista de anotados
            //con el candidato. (No olvidadr cambiar el estado TANTO EN CLASE ESPECIFICA como en RESERVA)
            console.log("Se encontró un usuario válido y que aceptó anotarse: ");
            await actualizarAnotado(clases, user) // Nosé si mandar un resultado acá, despues veo
        }
////////////////////////////////////////////////////////////
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

//ya debería estar joya este
async function obtenerCandidatosUnicos(clasesLiberadas){

   const candidatos = [];

   for(const clase of clasesLiberadas){
      candidatos.push(
         ...clase.esperaUnica
      );
   }

   return candidatos;
}

//ya debería estar joya este
async function obtenerCandidatosMensuales(clasesLiberadas){

    console.log(clasesLiberadas)

   const candidatos = [];

   for(const clase of clasesLiberadas.idClase){
      candidatos.push(
         ...clase.esperaMensual
      );
   }
   return eliminarDup(candidatos);
}

//ya debería estar joya este
async function eliminarDup(candidatos){
    return [
        ...new Map(
            candidatos.map(
                candidato => [
                    candidato.idUsuario,
                    candidato
                ]
            )
        ).values()
    ];
}

async function procesarCandidatos(candidatos, clasesLiberadas, idUsuarioCancelado, tipoCancelacion){

    let indiceValido = -1;

    for(let i = 0; i < candidatos.length; i++){

        const candidato = candidatos[i];

        //Controlo que las clasesEspecificas que pertenecen a la reserva del
        //candidato sean utilizables
        const esValido = await validarReemplazo(candidato, clasesLiberadas, candidato.tipo);

        if(esValido){
            indiceValido = i;
            break;
        }
    }

    //Si ningún candidato era válido,
    //no creo listaDeCandidatos y retorno null
    if (indiceValido === -1){
        return null;
    }

    //Se crea la lista de candidatos con los candidatos pendientes en caso de
    //que el cliente rechace el mail o se venza el tiempo de espera.
    const lista = await listaCandidatosDao.create({
        idsClasesEspecificas: clasesLiberadas.map(clase => clase._id),

        //Me quedo con los candidatos restantes
        candidatos: candidatos.slice(indiceValido),

        idUsuarioCancelado,

        tipoCancelacion,

        candidatoActual: 0,

        estado: "pendiente",

        //No recuerdo cuanto era lo que habia que esperar hasta el siguiente.
        fechaLimite: new Date(Date.now() + 30 * 60 * 1000)
    });

    const candidatoValido = candidatos[indiceValido];

    //Mando mail al candidato válido (crear un nuevo endpoint)
    await notificarUsuario(candidatoValido, clasesLiberadas);

    return lista;
}

//Pasar esta funcióin a reemplazo.servicio.js
//también la voy a utilizar con cron.
async function validarReemplazo(candidato, clase){

    console.log("Dentro de validar reemplazo: ");
    console.log("El candidato es el: ")
    console.log(candidato);
    console.log("&&&&&&&&&&&&&&&&&");
    console.log("El tipo de reemplazo que se verificará siempre será UNICO ")
    console.log("Las clases a validar son: ")
    console.log(clases);
    console.log("&&&&&&&&&&&&&&&&&");
    console.log("&&&&&&&&&&&&&&&&&");
    

    let reserva = null;
   
    const idsClases = [];
    for(const item of clases){
        idsClases.push(item.idClase._id);
    }

    
    console.log(idsClases)

     /**
     * Caso 1: El candidato es de reserva mensual
     */
    if (tipoReemplazo === 'mensual'){
        //paso 1: Obtener todas las clases de la reserva del candidato
        
        //¿Debería agregar a la lista de anotados la reserva a la que pertenece el?

        reserva = reservaDao.readOne({ idUsuario: candidato.idUsuario,
            cancelada: false,
            tipo: 'mensual',
            clases: {
                $elemMatch: {
                    idClase: {
                        $in: idsClases
                    }
                }
            },
        });
    }
    /**
     * Caso 2: El candidato es de reserva única o seña
     */
    else{
        reserva = await reservaDao.readOne({ idUsuario: candidato.idUsuario,
            cancelada: false,
            tipo: 'unica', //Verificar
            idClaseEspecifica: clases[0].idClase._id
        });
    }

    if(!reserva){
        return false;
    }
    else{

    }


    /**
     * Caso 3: La cancelación mensual fue realizada
     * luego de haber hecho alguna clase (clasesLiberadas < 4)
     * 
     * En este caso, si el candidato es mensual, debo crear las
     * clases especificas necesarias o controlar que existan
     */

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

/**
 * Función para encontrar las clases especificas del usuario que pasará
 * de lista de espera a lista de anotados.
 * (En caso de que el usuario que canceló era mensual y ya habia realizado
 * una o más clases de la mensualidad)
 * 
 * Se utilizará en validarReemplazo
 */
async function obtenerClasesNecesarias(candidato, clasesLiberadas){

}

////////////////////


export async function cancelarReserva(req, res) {
    try {

        /**
         *  Lista de Anotados Mensuales
         *  Lista de Anotados Clase única
         *  Lista de Anotados Seña(?) ---> ¿Los tratamos igual que los de clase única? y si es así,
         *                                  ¿deberíamos hacer que page antes de pasarlos a lista de anotados?
         * 
         * Si uno cancela, el que pasará de la lista de espera se priorizará según el tipo que cancele
         * Ejemplo: si cancela alguien de mensual, se tomará a alguien en lista de espera que sea de tipo
         * mensual.
         * 
         *  1- Si el elegido no puede ser insertado (MÁS ABAJO EXPLICO PQ), se probará con el siguiente
         * 
         *  2- Y si ningúno de tipo mensual es insertado, entonces:
         * 
         *     2.1- Por cada clase Especifica "liberada" se insertará uno de tipo clase única (ya sea señado o no señado)
         * 
         *          Nota: (obviamente que se tiene que consultar al elegido si desea aceptar esa clase específica antes
         *                 de insertarlo en la lista de anotados.)
         * 
         * Nota: Respecto de "liberar" (No se elimina de la lista de anotados al usuario, sino que se marca la reserva como
         *          cancelada y luego se usará eso para reemplazar al usuario en la lista de anotados)
         */
        const tipo = req.body.tipo;
        const clase = req.body.clase;
        const user = req.session.user.id;
        console.log("Desde cancelarReserva Controller: ");
        console.log(tipo);
        console.log(clase);

        //Si hay personas en espera --> controlo el tipo que pasará a la lista de anotados
        if (clase.espera.length !== 0){
            /**
             * PROBLEMA: Actalmente, al comprar una reserva mensual, se consulta si la clase especifica existe
             *      si existe y tiene espacio --> se pone en lista de anotados,
             *      si existe y no tiene espacio --> se pone en lista de espera,
             *      no existe --> crea las que no existan (máximo 4) y se anota en cada una).
             * AHORA, si la persona que esta en lista de espera (y es espera mensual) NO está esperando
             * en las mismas 4 clasesEspecificas que la persona que canceló su reserva, entonces
             * se debe revisar:
             * 
             *      1- La persona en espera tiene 4 clasesEspecificas en las que está esperando ser anotado (osea que el día
             *          en el que hizo la reserva inicial aún no pasó).
             * 
             *          1.1- Si la fecha de reserva inicial ya pasó, se podría preguntar al usuario si desea anotarse
             *                  a la mensualidad a partir de esa fecha. ---> más lógica y crea un nuevo problema.
             * 
             *      2- Las 4 clasesEspecificas tienen espacio en la lista de anotados (puede pasar que: si la persona que cancela
             *          ya realizó 2 clases de su reserva mensual, solo se liberarían las 2 clasesEspecificas
             *          restantes y, por lo tanto, puede ocurrir que luego de esas 2 clasesEspecificas restantes
             *          existan 2 claseEspecificas y con lista de anotados ya llena lo que descalificaría a las mensuales.
             * 
             *          2.1- Si se quiere evitar esto último, podriamos hacer que una vez que una persona realizó una clase
             *               de su reserva mensual, ya no pueda cancelar pero esto no tiene mucho sentido.
             * 
             *          2.2- En este caso, ya no se debería poder anotar a una mensualidad, sino que pasar a anotar a 1 o varias
             *               únicas.
             * 
             *      3- Tenia otra duda pero ya no me acuerdo de que era.
             * 
             */

            if (tipo === "mensual") {
                //marco todas las clases con el usuario cancelado 
                for(const act in clase){
                    if (!act) continue; //Controlo que no sea null
                    /* //busco el indice en la lista de anotados del usuario que canceló la reserva
                    const posUsuario = act.anotados.findIndex(
                        usuario => usuario.idUsuario === user
                    ); */

                    //actualizo la clase especifica con el usuario anotado con estado cancelado (borrado lógico)
                    const updateado = await claseEspecificaDao.updateOne({ _id: act._id, "anotados.idUsuario": user},
                        { $set: { "anotados.$.estado": "cancelado" }} )
                }

                //buscar al usuario que pasará de espera a anotados.

                    //controlar a qué clases debería anotarse el usuario a anotar.

                    //si son clases válidas y con espacio en lista de anotados -- anotar

                    //sino, buscar el siguiente

                //si no hay siguiente, buscar (por cada una de las clases en las que canceló)
                //desde el inicio pero ahora clases únicas
                
            }
            //sino, es única o seña, en cuyo caso, de la lista de espera se saca el primero de única o seña que haya
            else{
                const act = clases[0];
                if (act) { //En teoría este no va ya que no puede ser null
                    const updateado = await claseEspecificaDao.updateOne({ _id: act._id, "anotados.idUsuario": user},
                        { $set: { "anotados.$.estado": "cancelado" }} );
                    //si hay gente en lista de espera
                    if (act.espera.length > 0) {
                        for(const espAct in act.espera){
                            if (espAct.tipo !== 'mensualidad'){
                                //mandar mail al usuario para confirmación

                                //¿como hago si el usuario no cancela y pasó el tiempo límite
                                // para mandar mensaje al siguiente usuario válido?
                                break;
                            }
                        }
                    }
                }
            }
        }
        else{
            //si NO hay personas en la lista de espera simplemente actualizo eliminando el usuario que cancelo de la lista de anotados
            
        }
    
        //Se actualiza la clase especifica con sacando al usuario de la lista de anotado
        //y agregando al usuario de la lista de espera a la lista de anotado.
        const actualizada = await claseEspecificaDao.updateOne({});

        return res.json({
            success: true,
            message: "Reservación cancelada exitosamente."
        })

    }
    catch(error) {
        console.error(error);
        return res.json({
            success: false,
            message: error
        })
    }
}

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
                enEspera: false
            });
        }
        const capacidadActual = claseEspecifica.anotados.length;

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


export async function getCancellations(req, res) {
    try {
        const uniqueReservations = await reservaDao.readManyUnica({});
        const monthlyReservations = await reservaDao.readManyMensual({});
        const generalClasses = await claseGeneralDao.readMany({});

        const newGeneralClasses = [];
        for (const gc of generalClasses) {
            const objProfesor = await profesorDao.readOne({ _id: gc.idProfesor });
            const profesor = objProfesor.nombre || "Profesor desconocido";
            newGeneralClasses.push({
                id: gc._id,
                clase: `${gc.dia}, ${gc.hora}:00 hs.`,
                profesor,
                precioMensual: gc.precioMensual,
                reservas: 0,
                cancelaciones: 0
            })
        }

        uniqueReservations.forEach(r => {
            let gc;
            if (r.idClase) {
                gc = newGeneralClasses.find(c => c.id === r.idClase);
            }
            else if (r.clases && r.clases.length > 0) {
                gc = newGeneralClasses.find(c => c.id === r.clases[0].idClase);
            }
            if (!gc) return;
            gc.reservas++;
            if (r.cancelada) gc.cancelaciones++;
        });


        for (const r of monthlyReservations) {
            let gc;
            if (r.idClase) {
                gc = newGeneralClasses.find(c => c.id === r.idClase);
            }
            else if (r.clases && r.clases.length > 0) {
                const uniqueClass = await claseEspecificaDao.readOne({ _id: r.clases[0].idClase });
                gc = newGeneralClasses.find(c => c.id === uniqueClass.idClaseGeneral);
            }
            if (!gc) return;
            gc.reservas++;
            if (r.cancelada) gc.cancelaciones++;
        }

        return res.json(newGeneralClasses);
    }
    catch (error) {
        console.error("getCancellations ERROR: ", error);
        res.json({
            success: false,
            message: "Error al recuperar las cancelaciones. Inténtelo de nuevo más tarde."
        });
    }
}