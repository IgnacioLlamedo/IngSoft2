import { usuarioDao } from "../daos/index.js";
import { planillaDao } from "../daos/index.js";
import { generateOtp } from '@mx7/otp';

export async function postController(req, res) {
    const planilla = {
        nombreEmergencia: req.body.nombreEmergencia,
        relacionEmergencia: req.body.relacionEmergencia,
        telefonoEmergencia: req.body.telefonoEmergencia,
        hipertension: req.body.hipertension,
        diabetes: req.body.diabetes,
        asma: req.body.asma,
        cardiacos: req.body.cardiacos,
        artritis: req.body.artitris, //aaaaaaaaaa
        epilepsia: req.body.epilepsia,
        lesiones: req.body.lesiones,
        otrosAntecedentes: req.body.otrosAntecedentes,
        fuma: req.body.fuma,
        alcohol: req.body.alcohol,
        sintomasRecientes: req.body.sintomasRecientes,
        sueño: req.body.sueño,
        dificultadDormir: req.body.dificultadDormir,
        nutricion: req.body.nutricion,
        cirugia: req.body.cirugia,
        fechaCirugia: req.body.fechaCirugiaDia, //aaaaaaaaaaaaaaaa
        secuelasCirugia: req.body.secuelasCirugias, //aaaaaaaaaaaa
        alergias: req.body.alergias,
        medicacionAlergia: req.body.medicacionAlergia,
        actividadFisica: req.body.actividadFisica,
        frecuenciaActividad: req.body.frecuenciaActividad,
        objetivo: req.body.objetivo,
    }
    const creada = await planillaDao.create(planilla)
    const usuario = {
        nombre: req.body.nombre,
        dni: req.body.dni,
        mail: req.body.mail,
        contraseña: req.body.contraseña,
        nacimiento: req.body.nacimiento,
        telefono: req.body.telefono,
        genero: req.body.genero,
        planilla: creada._id
    }
    await usuarioDao.create(usuario)
}

export async function crearCodigo(req, res){
    await usuarioDao.updateOne(req.body.mail, {
        codigo: generateOtp(),
        limiteCodigo: new Date(Date.now() + 600000)
    })
}


