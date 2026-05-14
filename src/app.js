import config from './config.js'
import express from 'express'
import nodemailer from 'nodemailer'
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { usuarioDao } from './daos/index.js'

const app = express()

app.use(express.json());
app.use(express.static("src/Front/Home"));
app.use(express.static("src/Front/Profile"));

app.get("/profile", (req, res) => {
    res.sendFile(process.cwd() + "/src/Front/Profile/profile.html");
});

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})
class mailer{
    constructor() {
        this.transport = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.mailUser,
                pass: config.mailPass
            }
        })
    }
    async send(receiver, subject, body, attach = []){
        const mailOptions = {
            from: config.mailUser,
            to: receiver,
            subject: subject,
            html: body
        }
        if(attach.length > 0){
            mailOptions.attachments = attach
        }
        await this.transport.sendMail(mailOptions)
    }
}
const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            auth: {
                user: config.mailUser,
                pass: config.mailPass
            }
        })
const mailOptions = {
            from: config.mailUser,
            to: "ignaciollamedo@hotmail.com",
            subject: "subject",
            html: `
        <h1>Purchase Ticket</h1>
        <ul>
            <li>Purchaser:</li>
            <li>Total amount: </li>
            <li>Date: </li>
            <li>Ticket code: </li>
        </ul>
        `
        }
        //const info = await transporter.sendMail(mailOptions)
    
console.log("aaaaaa")

// Crear cliente Mercado Pago -> toma el token dentro de .env (Prueba), hay que cambiarlo en producción.
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

//Más adelante: Agregar Webhook y
// guardar en DB -> Preguntar a Nacho
app.post("/controllers/crearPreferencia", async (req, res) => {
  try {
    const preference = new Preference(client)
    const response = await preference.create({
        body: {
            items: [
            {
                title: req.body.tipo,
                quantity: Number(req.body.cantidad),
                unit_price: Number(req.body.precio)
            }
            ],
            back_urls: {//Una vez realizado el pago dentro de mercado pago, se retorna  a algúno de estas url,
            // crear una para cada caso dentro de /Front o, cambiar la url para que siempre vuelva a index y en todo caso mostrar un msg
            success: "http://localhost:8080/success.html",
            failure: "http://localhost:8080/failure.html",
            pending: "http://localhost:8080/pending.html"
            },
        //auto_return: "approved"  -->>   descomentar cuando la dirección de retorno (cualquier back_url) NO sea local.
        }
});
    res.json({ init_point: response.init_point });

  } catch (error) {
    console.error(error);
    console.log("entró al error.")
    res.status(500).send("Error al crear preferencia");
  }
});

//prueba de base de datos
/* usuarioDao.create({
    mail: "test@example.com",
    dni: "12345678",
    contraseña: "password123",
    nombre: "Usuario Test",
    nacimiento: new Date("1990-01-01"),
    telefono: "123456789",
    genero: "masculino",
    planilla: "planilla123"
}) */
