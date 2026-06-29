import { Preference, Payment } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";
import { pagoDao, claseEspecificaDao, claseGeneralDao, usuarioDao, actividadDao } from "../daos/index.js";
import config from "../config.js";
import { Role } from "../constants/constants.js";
import { now } from "mongoose";
import { webhookPago } from "./webhook.controller.js";
import { aceptarCupoInterno } from "./cupo.controller.js";
import { postReservaMensual, postReservaUnica } from "./reservas.controller.js";

export async function crearPreferencia(req, res) {

    try {
        const nombre = req.body.nombre; //Yoga, Funcional o Spinning
        const precio = req.body.precio; 
        const tipoClase = req.body.tipoClase; //seña, unica o mensual
        const clases = req.body.clases;
        const datosExternos = req.body.idCupo;

        /* for (const c of clasesObtenidas.clases) {

            clases.push(c.idClaseGeneral);

            fechas.push(c.fechaEspecifica);

            console.log(c.idClaseGeneral);
            console.log(c.fechaEspecifica);
        } */

        console.log("1");

        const clasesFormateadas = clases.map(c => ({
            idClase: c.idClaseGeneral,
            fecha: c.fechaEspecifica
        }));

        const clasesFormateadasString = JSON.stringify(clasesFormateadas);
        
        //Es basicamente las clases pasadas a un string que sirve como identificador
        const clavePago = JSON.stringify(
            clases
                .map(c=>({
                    idClase:c.idClaseGeneral,
                    fecha:new Date(c.fechaEspecifica).toISOString()
                }))
                .sort((a,b)=>
                    a.idClase.localeCompare(b.idClase) ||
                    a.fecha.localeCompare(b.fecha)
                )
        );

        /** Verifico que no exista un pago con ese idUsuario y esas clases */
        let pagoPendiente = await pagoDao.readOne({
            idUsuario: req.session.user.id,
            estado: 'PENDIENTE',
            clavePago: clavePago
        })

        /**
         * En caso de existir, devuelvo el mismo checkout.
         * Esto hace que se abra MP con la misma preferencia creada anteriormente.
         * Y si intenta pagar una preferencia ya aprobada MP debería evitarlo.
        */
    /*     if (pagoPendiente){              DESCOMENTAR ESTO DESPUES!!!!!!!
            return res.json({
                success: true,
                init_point: pagoPendiente.initPoint,
                reutilizado: true
            });
        }
 */
        //Si NO existe un pago previo, creo preferencia y realizo el pago.
        const fechaPago = new Date(Date.now());

        pagoPendiente = await pagoDao.create({
            monto: precio,
            idUsuario: req.session.user.id,
            clases: clasesFormateadas, //Contiene los id de clases y fechas especificas (en el caso de Mensual, contiene 4 de c/u)
            clavePago: clavePago,
            fechaPago: fechaPago
        });

        console.log("Preference:", Preference);
        console.log("Client:", client);


        const preference = new Preference(client);

        console.log("2");

        const response = await preference.create(
            {
                body: {
                    items: [
                        {
                            title: nombre,
                            quantity: 1,
                            unit_price: Number(precio)
                        }
                    ],
                    external_reference: JSON.stringify({
                        idUsuario: req.session.user.id,
                        tipoClase: tipoClase,
                        nombre: nombre, //Nombre clase (yoga, spinning o funcional)
                        idPagoPendiente: pagoPendiente._id,
                        idCupo: datosExternos
                    }),
                    notification_url: `${config.link}/api/webhook/webhook`,
                    back_urls: {
                        success: `${config.link}/payment/approved`,
                        failure: `${config.link}/payment/failure`,
                        pending: `${config.link}/payment/pending`,
                    },
                    auto_return: "approved"
                }
            }
        );

        console.log("3");

        console.log("Esta es la preferencia creada, habría que guardarla en DB para evitar duplicados?");
        console.log(response);

        /*
        console.log("((((((((((((((((((((((((((((((((((((");
        console.log("((((((((((((((((((((((((((((((((((((");
        console.log("((((((((((((((((((((((((((((((((((((");
        console.log("El id de la preferencia es: ")
        console.log(response.id);
        console.log("El init point de la preferencia es: ")
        console.log(response.init_point); */

        await pagoDao.updateOne(
            {
            _id: pagoPendiente._id
            },
            {
                estado: 'PENDIENTE',
                idPreferencia: response.id,
                initPoint: response.init_point
            } 
        );

        res.json({
            init_point: response.init_point
        });

    } 
    catch(error) {

        console.error("ERROR COMPLETO:");
    console.error(error);

    console.error("Mensaje:", error.message);

    if (error.cause) {
        console.error("Cause:", error.cause);
    }

    if (error.response) {
        console.error(error.response.data);
    }

    return res.status(500).json({
        success: false,
        error: error.message
    });
    }
}

export async function obtenerPago(req, res) {
    try {

        const { idPagoPendiente } = req.params;

        const pago = await pagoDao.readOne({
            _id: idPagoPendiente
        });

        if (!pago) {
            return res.json({
                success: false,
                message: "Pago no encontrado."
            });
        }

        return res.json({
            success: true,
            data: pago
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: "Error al obtener el pago."
        });

    }
}

//Básicamente hace toda la funcionalidad que hacia paymentApproved.js
export async function procesarWebhook(body){

    console.log("Desde procesarWebhook!!!!!");
    console.log("                                           ")
    console.log("                                           ")

    if(body.type !== "payment"){
        return;
    }

    //Busco el pago en la api de MP
    const payment = new Payment(client);
    const mpPayment = await payment.get({
        id: body.data.id
    })

    console.log("Parte número 1: ")
    console.log("Este es el pago de mercado pago: ")
    console.log(mpPayment);
    console.log("                                           ")
    console.log("                                           ")

    //Si el pago no fue aprobado, no tiene sentido continuar ejecución
    if(mpPayment.status !== "approved"){
        return;
    }

    //Si el pago fue aprovado, controlo que no este aprobado en mi base de datos.-
    const external = JSON.parse(mpPayment.external_reference);

    const pago = await pagoDao.readOne({
        _id: external.idPagoPendiente
    });

    console.log("Parte número 2: ")
    console.log("Este es el pago registrado en la base de datos!!!");
    console.log(pago);
    console.log("                                           ")
    console.log("                                           ")

    //Si el pago en la base de datos ya está aprobado, no sigo procesando.
    if(pago.estado==="APROBADO"){
        return;
    }

    /**
     * Estos son los pasos que se realizaban en paymentApproved.js
     */

    //confirmar el pago
    console.log("Parte número 3: ")
    const confirmadoElPago = await confirmarPagoInterno(mpPayment);
    console.log("El pago interno fue confirmado!!!");
    console.log(confirmadoElPago);
    console.log("             ");

    let reservaCreada;
    //crear reserva
    if(external.tipoClase==="mensual"){
        reservaCreada = await postReservaMensual(pago);
    }
    else {
        reservaCreada = await postReservaUnica(pago, external.tipoClase==="seña");
    }
    console.log("Parte número 4: ")
    console.log("             ");
    console.log(`Esta es la reserva creada según su tipo (${external.tipoClase}): `)
    console.log(reservaCreada);
    console.log("             ");

    //aceptar 
    console.log("                                           ")
    console.log("                                           ")
    console.log("Parte número 5: ")

//////////////////////////////////////////
// Acá no debería haber cupos!!!!

    if(external.idCupo) {
        const aceptandoCupo = await aceptarCupoInterno(external.idCupo);
        console.log("             ");
        console.log("El cupo fue aceptado con exito? --- respuesta: ", aceptandoCupo.success);
    }

    //actualizar estado
    await pagoDao.updateOne(
        {_id:pago._id},
        {
            estado:"APROBADO"
        }
    );
    console.log("             ");
    console.log("             ");
    console.log("Finalizado desde webhooks!!!!!!!!!!!!!");
    
}

/* Función para consultar si el usuario ya está anotado en la/las clase
específica/s (en caso de que sea mensual) */
export async function consultar(req, res) {
    try {

        const { clases } = req.body;
        let datos = []
        let int = 0;

        for (const claseData of clases) {

            /* console.log("La idClase General " + claseData.idClaseGeneral + " en la fecha " + claseData.fechaEspecifica);
            console.log(claseData.fechaEspecifica); */

            //Consigo la clase especifica
            const clase = await claseEspecificaDao.readOne({idClaseGeneral: claseData.idClaseGeneral, fechaEspecifica: claseData.fechaEspecifica});
            //Si existe la primera del día 1/7, las del 8/7, 15/7 y 22/7 si o si

            /* console.log("La idClase General " + claseData.idClaseGeneral + " en la fecha " + claseData.fechaEspecifica + ". Encontró la siguiente clase especifica: ");
            console.log(claseEspecifica); */
            //Revisar listado de anotados y de esprea

            /**
             * Si no encuentra clase especifica, significa que la clase en la fecha claseData.fechaEspecifica (actual del for)
             * No fue creada y por lo tanto no tiene anotados, Por lo tanto, al pagar, se debe crear la claseEspecifica.
             */
            if (!clase){
                datos.push({
                    clase: null,
                    llena: false
                });

                continue; //Saltea el resto del código y vuelve a entrar al for.
            }

            const claseGeneral = await claseGeneralDao.readOne({ _id: clase.idClaseGeneral })
            const llena = clase.anotados.length >= claseGeneral.limiteClase

            datos.push({
                clase,
                llena
            });

            /**
             * Acá hay un problema:
             * 
             * Como no hacemos borrado físico, cuando una persona
             * cancela su reservación a una clase (ya sea si está en lista de anotados
             *  o en algúna lista de espera), al hacer estas consultas siempre devolverá 
             * que el usuario ya está anotado o en espera.
             *  Por lo que no te deja inscribirte nuevamente a una clase que ya cancelaste.
             * ¿Esto está bien?
             */
            const yaAnotado = clase.anotados.some(
                u => u.idUsuario === req.session.user.id
            );
            const yaEnEsperaUnica = clase.esperaUnica.some(
                u => u.idUsuario === req.session.user.id
            );
            const yaEnEsperaMensual = clase.esperaMensual.some(
                u => u.idUsuario === req.session.user.id
            );

            //Si está en lista de anotados o de espera corta el bucle
            if (yaAnotado) {
                return res.json({
                    success: false,
                    message: `Ya se encuentra anotado en la actividad del día ${claseData.fechaEspecifica}`
                });
            }

            if (yaEnEsperaMensual){
                return res.json({
                    success: false,
                    message: `Ya se encuentra en lista de espera mensual en la actividad del día ${claseData.fechaEspecifica}`
                })
            }

            if (yaEnEsperaUnica){
                return res.json({
                    success: false,
                    message: `Ya se encuentra en lista de espera en la actividad del día ${claseData.fechaEspecifica}`
                })
            }

            int++;
        }

        return res.json({
            success: true,
            datos //Esto devuelve un arreglo con:
            // .clase: (objeto) Clase especifica o
            //                  NULL (en caso de que no exista la claseEspecifica).
        }); // .llena: (boolean) Si la clase especifica está llena o no

    }
    catch(error) {

        console.log(error);

        res.json({
            success: false,
            message: "NO se encontró la clase Especifica buscada. -> en teoría no puede suceder xd"
        });
    }
}

export async function confirmarPagoInterno(mpPayment) {

    const external = JSON.parse(mpPayment.external_reference);

    const pago = await pagoDao.readOne({
        _id: external.idPagoPendiente
    });

    if (!pago)
        throw new Error("Pago no encontrado.");

    if (pago.estado === "APROBADO"){
        console.log("El pago ya está registrado como aprobado en la DB!")
        return pago;
    }  

    console.log("Desde confirmarPagoInterno::: El pago no estaba confirmado como aprobado en DB!! --- sería lo normal!")
    return await pagoDao.updateOne(
        { _id: pago._id },
        {
            estado: "APROBADO",
            fechaPago: new Date(mpPayment.date_approved)
        }
    );
}

export async function confirmarPagoController(req, res){
    try {
        const dataPago = req.body;
        console.log("Los datos que llegan a almacenarPagoController");
        console.log(dataPago);

        console.log("El contenido de body dentro de confirmarPagoController es: ");
        console.log(dataPago);
        console.log(dataPago.idPagoPendiente);
        const pagoData = await pagoDao.readOne({_id: dataPago.idPagoPendiente});

        if(!pagoData){
            return res.json({
                success: false,
                message: "No se encontró el pago pendiente."
            })
        }

        const updateado = await pagoDao.updateOne({_id: dataPago.idPagoPendiente}, {pendiente: false, fechaPago: dataPago.fechaPago})
        //Actualizo el estado pendiente a false -> porque ya se confirmó el pago.
        //y la fechaPago con la brindada por mercado pago en la url...

        res.json({
            success: true,
            data: updateado,  //Devuelve Pago con un objeto que es un array, cada celda con: idClaseGeneral y fechaEspecifica
        })
    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error al almacenar datos de pago en DB."
        })
    }
}


export async function getPaymentsController(req, res) {
    try {
        const sessionUser = req.session && req.session.user;

        if (!sessionUser || sessionUser.rol !== Role.ADMIN) {
            return res.status(403).json({ success: false, message: 'Acceso denegado' });
        }

        const query = req.query || {};

        const payments = await pagoDao.readMany(query);
        
        // Nuevo arreglo con la información extra que necesito de cada pago
        const paymentsWithInfo = await generatePaymentsWithInfo(payments);

        return res.json(paymentsWithInfo);

    } catch (error) {
        console.error('getPaymentsController ERROR: ', error);
        return res.status(500).json({ success: false, message: 'Error al obtener la lista de usuarios. Inténtelo más tarde.' });
    }
}


async function generatePaymentsWithInfo(payments) {
    const paymentsWithInfo = [];

    for (const p of payments) {
        const fecha = (p.fecha != null) ? p.fecha : p.clases[0].fecha;

        const objUsuario = await usuarioDao.readOne({ _id: p.idUsuario });
        const usuario = (objUsuario) ? objUsuario.mail : "Usuario desconocido";

        const tipo = (p.clases && p.clases.length > 1) ? "Mensualidad" : "Clase Única";

        const idClase = p.idClase || p.clases[0].idClase;
        const objClase = await claseGeneralDao.readOne({ _id: idClase });
        const clase = (objClase) ? `${objClase.dia}, ${objClase.hora}:00 hs.` : "Horario desconocido";

        const objActividad = await actividadDao.readOne({ _id: objClase.idActividad });
        const actividad = (objActividad) ? objActividad.nombre : "Actividad desconocida";

        paymentsWithInfo.push({
            fecha,
            usuario,
            monto: p.monto,
            tipo,
            clase,
            actividad,
            pendiente: p.pendiente
        });
    }
    return paymentsWithInfo;
}
