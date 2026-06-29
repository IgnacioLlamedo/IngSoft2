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

    const nombre = req.body.nombre;
    const precio = req.body.precio;
    const tipoClase = req.body.tipoClase;
    const clases = req.body.clases;
    const datosExternos = req.body.idCupo;

    // Clases con el formato del schema Pago
    const clasesFormateadas = clases.map(c => ({
        idClase: c.idClaseGeneral,
        fecha: c.fechaEspecifica
    }));

    // Clave única del pago
    const clavePago = JSON.stringify(
        clases
            .map(c => ({
                idClase: c.idClaseGeneral,
                fecha: new Date(c.fechaEspecifica).toISOString()
            }))
            .sort((a, b) =>
                a.idClase.localeCompare(b.idClase) ||
                a.fecha.localeCompare(b.fecha)
            )
    );

    const fechaPago = new Date();

    let pagoPendiente;

    //---------------------------------------
    // Intento crear el pago pendiente
    //---------------------------------------

    try {

        pagoPendiente = await pagoDao.create({
            monto: precio,
            idUsuario: req.session.user.id,
            clases: clasesFormateadas,
            clavePago,
            fechaPago,
            estado: "CREANDO"
        });

    }
    catch (error) {

        if (error.code === 11000) {

            const pagoExistente = await pagoDao.readOne({
                idUsuario: req.session.user.id,
                clavePago
            });

            if (pagoExistente?.initPoint) {
                return res.json({
                    success: true,
                    init_point: pagoExistente.initPoint,
                    reutilizado: true
                });
            }

            return res.status(409).json({
                success: false,
                message: "Ya se está generando un pago para estas clases."
            });
        }

        throw error;
    }

    //---------------------------------------
    // Creo la preferencia
    //---------------------------------------

    try {

        const ahora = new Date();
        const vence = new Date(ahora.getTime() + 60 * 1000); //La preferencia vence despues de 1 minuto...

        const preference = new Preference(client);

        const response = await preference.create({
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
                    tipoClase,
                    nombre,
                    idPagoPendiente: pagoPendiente._id,
                    idCupo: datosExternos
                }),
                notification_url: `${config.link}/api/webhook/webhook`,
                back_urls: {
                    success: `${config.link}/payment/approved`,
                    failure: `${config.link}/payment/failure`,
                    pending: `${config.link}/payment/pending`
                },
                auto_return: "approved",
                expires: true,
                expiration_date_from: ahora.toISOString(),
                expiration_date_to: vence.toISOString()
            }
        });

        await pagoDao.updateOne(
            { _id: pagoPendiente._id },
            {
                estado: "PENDIENTE",
                idPreferencia: response.id,
                initPoint: response.init_point
            }
        );

        return res.json({
            success: true,
            init_point: response.init_point
        });

    }
    catch (error) {

        // Si falló Mercado Pago, elimino el pago pendiente
        await pagoDao.delete({ _id: pagoPendiente._id });

        throw error;
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

    /* console.log("Desde procesarWebhook!!!!!");
    console.log("                                           ")
    console.log("                                           ") */


    if(body.type !== "payment"){
        /* console.log("El tipo del body NO es PAYMENT, saliendo...") */
        return;
    }

    /* console.log("El tipo del body es 'PAYMENT' ---- Ahora sigue la secuencia de la función.")

    console.log("Este es el body dentro de procesarWebhook: ")
    console.log(body);
    console.log("                                           ")
    console.log("                                           ") */

    //Busco el pago en la api de MP
    const payment = new Payment(client);
    const mpPayment = await payment.get({
        id: body.data.id
    })

    /* console.log("Parte número 1: ")
    console.log("Este es el pago de mercado pago: ")
    console.log(mpPayment);
    console.log("                                           ")
    console.log("                                           ") */

    //Si el pago no fue aprobado, no tiene sentido continuar ejecución
    if(mpPayment.status !== "approved"){
        console.log("El estado del pago (recibido desde MercadoPago) NO es aprobado... retornando...");
        return;
    }

    //Si el pago fue aprovado, controlo que no este aprobado en mi base de datos.-
    const external = JSON.parse(mpPayment.external_reference);

    /* console.log("Estos son los datos dentro de la referencia externa:  ");
    console.log(external);
    console.log("                                           ");
    console.log("                                           "); */

    const pago = await pagoDao.readOne({
        _id: external.idPagoPendiente
    });

    /* console.log("Parte número 2: ")
    console.log("Este es el pago registrado en la base de datos!!!");
    console.log("En teoría el estado del pago debería ser 'PENDIENTE' hasta que se ejecute la parte 3 - unas lineas más adelante...")
    console.log(pago);
    console.log("                                           ");
    console.log("                                           "); */

    if (!pago) {
        console.log("NO EXISTE PAGO... En teoría no debería poder ocurrir...")
        return;
    }

    //Si el pago en la base de datos ya está aprobado, no sigo procesando.
    if(pago.estado==="APROBADO"){
        return;
    }

    /**
     * Estos son los pasos que se realizaban en paymentApproved.js
     */

    //confirmar el pago
    /* console.log("Parte número 3: ")
    console.log("Buscando y confirmando el pago en la DB, si el mismo ya estaba aprobado, no hace nada: ") */
    //en esta función se cambia el estado del pago en DB de pendiente a aprobado
    //y también se cambia la fechaPago a new Date(mpPayment.date_approved)
    const confirmadoElPago = await confirmarPagoInterno(mpPayment);
    /* console.log("El estado del pago es: ");
    console.log(confirmadoElPago.estado); */


    let reservaCreada;
    //crear reserva
    if(external.tipoClase==="mensual"){
        reservaCreada = await postReservaMensual(confirmadoElPago);
        /* console.log("La reserva creada es de tipo MENSUAL: ");
        console.log(reservaCreada); */
    }
    else {
        reservaCreada = await postReservaUnica(confirmadoElPago, external.tipoClase==="seña");
        /* console.log("La reserva creada es de tipo UNICA: ");
        console.log(reservaCreada); */
    }
    /* console.log("                                           ")
    console.log("                                           ") 
    console.log("Parte número 4: ") */
    console.log(`Esta es la reserva creada según su tipo (${external.tipoClase}): `)
    if (reservaCreada.success)
        console.log(reservaCreada.reserva);
    else
        console.log(reservaCreada.message)

    /* console.log("             ");
    console.log("             ");
    console.log("Finalizado desde webhooks!!!!!!!!!!!!!"); */
    
}

/* Función para consultar si el usuario ya está anotado en la/las clase
específica/s (en caso de que sea mensual) */
export async function consultar(req, res) {
    try {

        const { clases } = req.body;
        const clasesBuscadas = clases.map(c => ({
            idClase: c.idClaseGeneral,
            fecha: new Date(c.fechaEspecifica).getTime()
        }));

        const pagosPendientes = await pagoDao.readMany({
            idUsuario: req.session.user.id,
            estado: "PENDIENTE"
        });

        const ahora = Date.now();
        const tiempoExpiracion = 2 * 60 * 1000; // 2 minutos

        for (const pago of pagosPendientes) {

            // Si el pago venció, lo elimino y sigo buscando
            if (ahora - new Date(pago.fechaPago).getTime() >= tiempoExpiracion) {
                await pagoDao.deleteOne({ _id: pago._id });
                continue;
            }

            // Verifico si alguna clase del pago coincide con alguna solicitada
            const coincide = pago.clases.some(clasePago =>
                clasesBuscadas.some(claseBuscada =>
                    clasePago.idClase === claseBuscada.idClase &&
                    new Date(clasePago.fecha).getTime() === claseBuscada.fecha
                )
            );

            if (coincide) {
                return res.json({
                    success: false,
                    message: "Ya existe un pago pendiente para una de las clases seleccionadas."
                });
            }
        }
        
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

            const fecha = new Intl.DateTimeFormat("es-AR").format(new Date(claseData.fechaEspecifica));

            //Si está en lista de anotados o de espera corta el bucle
            if (yaAnotado) {
                return res.json({
                    success: false,
                    message: `Ya se encuentra anotado en la actividad del día ${fecha}`
                });
            }

            if (yaEnEsperaMensual){
                return res.json({
                    success: false,
                    message: `Ya se encuentra en lista de espera mensual en la actividad del día ${fecha}`
                })
            }

            if (yaEnEsperaUnica){
                return res.json({
                    success: false,
                    message: `Ya se encuentra en lista de espera en la actividad del día ${fecha}`
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
