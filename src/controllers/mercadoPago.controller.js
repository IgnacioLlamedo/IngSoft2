import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";
import { now } from "mongoose";
import { pagoDao } from "../daos/index.js";

export async function crearPreferencia(req, res) {

    try {
        const monto = req.body.precio;
        const id_clase = req.body.idClase;
        const tipoClase = req.body.tipoClase;
        const fechaEspecifica = req.body.fechaEspecifica;
        const urlRetorno = req.body.url;
        const url = `${urlRetorno}/home`;

        console.log(url)

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        title: req.body.tipo,
                        quantity: 1,
                        unit_price: Number(monto)
                    }
                ],
                external_reference: JSON.stringify({    //Todo esto termina en la url una vez que se retorna a /home
                    idUsuario: req.session.user.id,        //Este es asignado al usuario cuando se logea (en autenticaión doble controller)
                    idClase: id_clase,         //Este se guarda al llamar a /crear-preferencia (en payPanel.js)
                    precio: monto,
                    tipoClase: tipoClase,
                    fechaEspecifica: fechaEspecifica,
                }),
                back_urls: {
                    success: url,
                    failure: url,
                    pending: url
                },
                auto_return: "approved"
            }
        });

        res.json({
            init_point: response.init_point
        });

    } catch(error) {

        console.error(error);

        res.status(500).json({
            error: "Error al crear preferencia"
        });
    }
}


export async function almacenarPagoController(req, res){
    try {
        let dataPago = req.body;
        console.log("Los datos que llegan a almacenarPagoController");
        console.log(dataPago);

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