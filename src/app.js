import config from './config.js'
import express from 'express'
import nodemailer from 'nodemailer'
import path from 'path';
import { fileURLToPath } from 'url';
import { usuarioDao } from './daos/index.js'
import { apiRouter } from './routes/api/api.router.js';

const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));


app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

app.use(express.json());

// Statics
//app.use(express.static(__dirname + "/Front/Static"));

app.use(express.static(__dirname + "/Front/Static", {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));


// Routes
app.use('/api', apiRouter)
app.get("/", (req,res) => res.sendFile(__dirname + "/Front/Home/index.html"))
app.get("/registro", (req,res) => res.sendFile(__dirname + "/Front/SignUp/signUp.html"))


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
    
//console.log("aaaaaa")

/* usuarioDao.create({
    mail: "aaaa@mail.com",
    dni: "aaaaaaaaa",
    contraseña: "muy segura",
    nombre: "gonzalo gonzales",
    nacimiento: Date.now,
    telefono: "123",
    genero: "otro",
    planilla: "a"
}) */

/* app.use(express.static(__dirname + "/Home"))
app.get("/registro", (req, res) => {
    res.sendFile(__dirname + "/Front/Sign-up/signUp.html")
}) */