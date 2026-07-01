import { devolverPago } from "./mercado.servicio.js";
import { pagoDao } from "../daos/index.js";

export async function procesarReintegro(reserva, clase, tipo, clasesEspecificas){

    console.log("========================================");
    console.log("===== INICIO procesarReintegro =====");
    console.log("Tipo:", tipo);
    console.log("Reserva:");
    console.log(reserva);
    console.log("Clase:");
    console.log(clase);
    console.log("========================================");

    if(tipo === "Unica"){
        console.log("La reserva es ÚNICA.");
        console.log("Corresponde reintegro completo.");
        return await devolverDinero(reserva);
    }

    //----------------------------------------
    // Mensual
    //----------------------------------------

    console.log("La reserva es MENSUAL.");

    const ahora = new Date();

    const horas =
        (new Date(clase.fechaEspecifica) - ahora)
        /1000/60/60;

    console.log("Fecha actual:", ahora);
    console.log("Fecha clase:", clase.fechaEspecifica);
    console.log("Horas restantes:", horas);

    if(horas < 24){
        console.log("No corresponde crédito.");
        console.log("La cancelación fue con menos de 24 horas.");
        return false;
    }

    console.log("Se canceló con más de 24 horas.");

    const cancelaciones = contarCancelacionesMes(reserva, clasesEspecificas);

    console.log("Cantidad de cancelaciones este mes:", cancelaciones);

    if(cancelaciones >= 3){
        console.log("El usuario ya posee 3 cancelaciones.");
        console.log("No corresponde generar crédito.");
        return false;
    }

    console.log("Corresponde generar crédito.");

    const credito = await generarCredito(reserva);

    console.log("Crédito generado correctamente.");
    console.log("Monto:", credito);

    console.log("===== FIN procesarReintegro =====");

    return credito;
}

export function contarCancelacionesMes(reserva, clasesEspecificas){

    console.log("========================================");
    console.log("Contando cancelaciones del mes...");
    console.log("========================================");

    const hoy = new Date();

    console.log("Fecha actual:", hoy);

    let total = 0;

    for (const clase of reserva.clases){

        console.log("--------------------------------");
        console.log("Clase de la reserva:");
        console.log(clase);

        if (clase.estado !== "cancelada"){
            console.log("La clase NO está cancelada.");
            continue;
        }

        console.log("La clase está cancelada.");

        // Busca la clase específica correspondiente
        const especifica = clasesEspecificas.find(
            c => c._id == clase.idClase
        );

        if (!especifica){
            console.log("No se encontró la clase específica.");
            continue;
        }

        console.log("Clase específica encontrada:");
        console.log(especifica);

        const fecha = new Date(especifica.fechaEspecifica);

        console.log("Fecha de la clase:", fecha);

        if (
            fecha.getMonth() === hoy.getMonth() &&
            fecha.getFullYear() === hoy.getFullYear()
        ){
            total++;
            console.log("Cuenta como cancelación del mes.");
        }
        else{
            console.log("La cancelación pertenece a otro mes.");
        }

    }

    console.log("========================================");
    console.log("Total cancelaciones del mes:", total);
    console.log("========================================");

    return total;
}

export async function devolverDinero(reserva){

    console.log("========================================");
    console.log("Procesando devolución de dinero...");
    console.log("Reserva:");
    console.log(reserva);

    const idPago = reserva.pagos[0].idPago;

    console.log("Buscando pago:", idPago);

    const pago = await pagoDao.readOne({
        _id: idPago
    });

    if(!pago){
        console.log("ERROR: No se encontró el pago.");
        throw new Error("Pago inexistente.");
    }

    console.log("Pago encontrado:");
    console.log(pago);

    console.log("Id Mercado Pago:", pago.idPagoMercadoPago);

    const devolucion = await devolverPago(pago.idPagoMercadoPago);

    console.log("Respuesta de Mercado Pago:");
    console.log(devolucion);

    console.log("Devolución realizada correctamente.");

    return devolucion;
}

export async function generarCredito(reserva){

    console.log("========================================");
    console.log("Generando crédito...");
    console.log("Reserva:");
    console.log(reserva);

    const idPago = reserva.pagos[0].idPago;

    console.log("Buscando pago:", idPago);

    const pago = await pagoDao.readOne({
        _id: idPago
    });

    if(!pago){
        console.log("ERROR: Pago inexistente.");
        throw new Error("No existe el pago.");
    }

    console.log("Pago encontrado:");
    console.log(pago);

    const clases = reserva.clases.length;

    console.log("Cantidad de clases de la mensualidad:", clases);

    const montoCredito = pago.monto / clases;

    console.log("Monto total abonado:", pago.monto);
    console.log("Monto del crédito:", montoCredito);

    console.log("Actualizando crédito del usuario:", reserva.idUsuario);

    const usuarioActualizado = await usuarioDao.updateOne(
        {
            _id: reserva.idUsuario
        },
        {
            $inc:{
                credito:montoCredito
            }
        }
    );

    console.log("Usuario actualizado:");
    console.log(usuarioActualizado);

    console.log("Crédito generado correctamente.");

    return montoCredito;
}