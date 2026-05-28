import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";
import { pagoDao, claseEspecificaDao } from "../daos/index.js";
import config from "../config.js";

export async function crearPreferencia(req, res) {

    try {
        const nombre = req.body.nombre; //Yoga, Funcional o Spinning
        const precio = req.body.precio; 
        const tipoClase = req.body.tipoClase; //seña, unica o mensual
        const clases = req.body.clases;

        console.log("Desde crearPreferencia. Los tipos de clases y fechas son: ")
/*         const clases = [];
        const fechas = []; */

        /* for (const c of clasesObtenidas.clases) {

            clases.push(c.idClaseGeneral);

            fechas.push(c.fechaEspecifica);

            console.log(c.idClaseGeneral);
            console.log(c.fechaEspecifica);
        } */

        const clasesFormateadas = clases.map(c => ({
            idClase: c.idClaseGeneral,
            fecha: c.fechaEspecifica
        }));
        
        const clasesFormateadasString = JSON.stringify(clasesFormateadas);

        const pagoPendiente = await pagoDao.create({
            monto: precio,
            idUsuario: req.session.user.id,
            clases: clasesFormateadas, //Contiene los id de clases y fechas especificas (en el caso de Mensual, contiene 4 de c/u)
            pendiente: true //Lo uso previo al pago, al entrar en paymentApproved.js, se cambia a false.
        });

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
                    tipoClase: tipoClase,
                    nombre: nombre, //Nombre clase (yoga, spinning o funcional)
                    idPagoPendiente: pagoPendiente._id
                }),
                back_urls: {
                    success: `${config.link}/payment/approved`,
                    failure: `${config.link}/payment/failure`,
                    pending: `${config.link}/payment/pending`,
                },
                auto_return: "approved"
            }
        });

        res.json({
            init_point: response.init_point
        });

    } 
    catch(error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear preferencia"
        });
    }
}

/* Función para consultar si el usuario ya está anotado en la/las clase
específica/s (en caso de que sea mensual) */
export async function consultar(req, res) {
    try {

        const { clases } = req.body;

        for (const claseData of clases) {

            console.log("La idClase General " + claseData.idClaseGeneral + " en la fecha " + claseData.fechaEspecifica);

            //Consigo la clase especifica
            const claseEspecifica = await claseEspecificaDao.readOne({idClaseGeneral: claseData.idClaseGeneral, fechaEspecifica: claseData.fechaEspecifica}); //Si existe la primera del día 1/7, las del 8/7, 15/7 y 22/7 si o si

            console.log("La idClase General " + claseData.idClaseGeneral + " en la fecha " + claseData.fechaEspecifica + ". Encontró la siguiente clase especifica: ");
            console.log(claseEspecifica);
            //Revisar listado de anotados y de esprea

            /**
             * Si no encuentra clase especifica, significa que la clase en la fecha claseData.fechaEspecifica (actual del for)
             * No fue creada y por lo tanto no tiene anotados, Por lo tanto, al pagar, se debe crear la claseEspecifica.
             */
            if (!claseEspecifica) 
                continue; //Saltea el resto del código y vuelve a entrar al for.

            const yaAnotado = claseEspecifica.anotados.some(
                u => u.idUsuario === req.session.user.id
            );
            const yaEnEspera = claseEspecifica.espera.some(
                u => u.idUsuario === req.session.user.id
            );

            //Si está en lista de anotados o de espera corta el bucle
            if (yaAnotado || yaEnEspera) {
                return res.json({
                    success: false,
                    message: ("Ya se encuentra anotado en la actividad")
                });
            }
        }

        return res.json({
            success: true
        });

    }
    catch(error) {

        console.log(error);

        res.json({
            success: false,
            message: "NO se encontró la clase Especifica buscada. -> en teoría no puede suceder xd"
        });
    }
}

/* export async function obtenerClaseGeneral(req, res){
    try{
        const claseGeneral = await claseGeneralDao.readOne


    }
    catch(error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Error al conseguir clase General (obtenerClaseGeneral)"
        })
    }
} */

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

        const updateado = await pagoDao.updateOne({_id: dataPago.idPagoPendiente}, {pendiente: false})
        //Actualizo el estado pendiente a false -> porque ya se confirmó el pago.

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