import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";

export async function crearPreferencia(req, res) {

    try {
        //body: JSON.stringify({ tipo: tipoClase, cantidad:1, monto: precio, id_Clase: idClase })
        const tipo = req.body.tipo;
        const monto = req.body.monto;
        const id_clase = req.body.id_Clase;
        const tipoClase = req.body.tipoClase;
        const fechaEspecifica = req.body.fechaEspecifica;
        console.log("Desde crear Preferencia!")
        console.log(tipo)
        console.log(id_clase)
        console.log(monto)
        console.log(tipoClase)
        console.log("finalizado el log desde crear preferencia!");

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: [
                    {
                        title: tipo,
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
                    success: "https://ingsoft2front.vercel.app/home",
                    failure: "https://ingsoft2front.vercel.app/home",
                    pending: "https://ingsoft2front.vercel.app/home"
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
        const dataPago = req.body;
        console.log(dataPago);

        const pagoData = await pagoDao.create(dataPago);   //Crea el nuevo pago y lo almacena en DB

        res.json({
            success: true,
            data: pagoData,
        })
    }
    catch(error) {
        res.json({
            success: false,
            message: "Error al almacenar datos de pago en DB."
        })
    }
}