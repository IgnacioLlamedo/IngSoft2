import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";
import { pagoDao, claseEspecificaDao } from "../daos/index.js";
import config from "../config.js";

export async function crearPreferencia(req, res) {

    try {
        const nombre = req.body.nombre; //Yoga, Funcional o Spinning
        const precio = req.body.precio; 
        const id_clase = req.body.idClase;
        const tipoClase = req.body.tipoClase; //Clase única o Mensual
        const fechaEspecifica = req.body.fechaEspecifica;

        /* console.log("Datos desde CrearPreferencia: ")
        console.log("Nombre de la clase: " + nombre)
        console.log("Id de la Clase: " + id_clase)
        console.log("Precio de la clase: " + precio)
        console.log("Tipo de reserva (Mensual o Unica): " + tipoClase) */

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
                    idUsuario: req.session.user.id, //Necesario para el pago.
                    idClase: id_clase, //Necesario para crear la reserva.
                    precio: precio, //Por ahora lo dejo para testear.

                    //Estos los requiere paymentApproved.js temporalmente, se puede recuperar despues veo como
                    fechaEspecifica: fechaEspecifica,
                    tipoClase: tipoClase,
                    nombre: nombre
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

/* Función para consultar si el usuario ya está anotado en la clase
específica */
export async function consultar(req, res) {
    try {

        const claseData = req.body;

        //consigo la clase especifica
        const claseEspecifica = await claseEspecificaDao.readOne({ idClaseGeneral: claseData.idClase, fechaEspecifica: claseData.fechaEspecifica });

        //usando los arrays de anotados y espera consulto si el idUSuario ya está en ellos
        const yaAnotado = claseEspecifica.anotados.some(
            u => u.idUsuario === req.session.user.id
        );

        const yaEnEspera = claseEspecifica.espera.some(
            u => u.idUsuario === req.session.user.id
        );
        
        if (yaAnotado || yaEnEspera) {
            return res.json({
                success: false,
                message: "Ya se encuentra anotado en esta actividad"
            });
        }  
        
        return res.json({
                success: true
            });

    }
    catch(error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error al consultar en db(?"
        })
    }
}

export async function almacenarPagoController(req, res){
    try {
<<<<<<< HEAD
        const dataPago = req.body;
        console.log("Los datos que llegan a almacenarPagoController");
        console.log(dataPago);
=======
        let dataPago = req.body;
>>>>>>> f092f67859a42ccb0807fa58ba85a79113d7fa18

        const pagoData = await pagoDao.create(dataPago);   //Crea el nuevo pago y lo almacena en DB

        if(!pagoData){
            return res.json({
                success: false,
                message: "Error al crear el nuevo pago en DB."
            })
        }
        res.json({
            success: true,
            data: pagoData,
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