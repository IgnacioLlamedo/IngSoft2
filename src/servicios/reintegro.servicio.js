import { devolverPago } from "./mercadoPago.servicio.js";

export async function procesarReintegro(reserva, clase, tipo){

    if(tipo === "Unica"){
        return await devolverDinero(reserva);
    }

    //----------------------------------------
    // Mensual
    //----------------------------------------

    const ahora = new Date();

    const horas =
        (new Date(clase.fechaEspecifica) - ahora)
        /1000/60/60;

    if(horas < 24){
        return false;
    }

    const cancelaciones = contarCancelacionesMes(reserva);

    if(cancelaciones >= 3){
        return false;
    }

    return await generarCredito(reserva);
}

export function contarCancelacionesMes(reserva, clasesEspecificas){

    const hoy = new Date();

    let total = 0;

    for (const clase of reserva.clases){

        if (clase.estado !== "cancelada")
            continue;

        const especifica = clasesEspecificas.find(
            c => c._id == clase.idClase
        );

        if (!especifica)
            continue;

        const fecha = new Date(especifica.fechaEspecifica);

        if (
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear()
        ){
            total++;
        }

    }

    return total;
}

export async function devolverDinero(reserva){

    const pago = await pagoDao.readOne({
        _id: reserva.pagos[0].idPago
    });

    if(!pago)
        throw new Error("Pago inexistente.");

    const devolucion = await mercadoPagoService.devolverPago(
            pago.idMercadoPago
        );

    return devolucion;
}

export async function generarCredito(reserva){

    const pago = await pagoDao.readOne({
        _id: reserva.pagos[0].idPago
    });

    if(!pago)
        throw new Error("No existe el pago.");

    const clases = reserva.clases.length;

    const montoCredito = pago.monto / clases;

    await usuarioDao.updateOne(
        {
            _id: reserva.idUsuario
        },
        {
            $inc:{
                credito:montoCredito
            }
        }
    );

    return montoCredito;
}