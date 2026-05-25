import { Preference } from "mercadopago";
import { client } from "../servicios/mercado.servicio.js";
import { pagoDao } from "../daos/index.js";
import config from "../config.js";

export async function crearPreferencia(req, res) {

    try {
        //body: JSON.stringify({ tipo: tipoClase, cantidad:1, monto: precio, id_Clase: idClase })
        const nombre = req.body.nombre; //Yoga, Funcional o Spinning
        const precio = req.body.precio; 
        const id_clase = req.body.idClase; //No se muestra
        const tipoClase = req.body.tipoClase; //Clase única o Mensual
        const fechaEspecifica = req.body.fechaEspecifica;
        console.log(nombre)
        console.log(id_clase)
        console.log(precio)
        console.log(tipoClase)

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
                external_reference: JSON.stringify({    //Todo esto termina en la url una vez que se retorna a /home
                    idUsuario: req.session.user.id ,        //Este es asignado al usuario cuando se logea (en autenticaión doble controller)
                    idClase: id_clase,         //Este se guarda al llamar a /crear-preferencia (en payPanel.js)
                    
                    //Se mostrarán una vez realizado el pago las siguientes:
                    nombre: nombre,
                    precio: precio,
                    tipoClase: tipoClase,
                    fechaEspecifica: fechaEspecifica,
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


//Ya funciona bien, si tocan algo les corto las bolas
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