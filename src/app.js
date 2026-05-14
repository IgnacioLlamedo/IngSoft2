import config from './config.js'
import express from 'express'
import nodemailer from 'nodemailer'
import path from 'path';
import { fileURLToPath } from 'url';
import { usuarioDao } from './daos/index.js'

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
app.get("/", (req,res) => res.sendFile(__dirname + "/Front/Home/index.html"))

// Access
app.get("/access/register", (req,res) => res.sendFile(__dirname + "/Front/Access/signUp.html"))
app.get("/access/login", (req,res) => res.sendFile(__dirname + "/Front/Access/signIn.html"))
app.get("/access/recover-password", (req,res) => res.sendFile(__dirname + "/Front/Access/recoverPassword.html"))
app.get("/access/reset-password", (req,res) => res.sendFile(__dirname + "/Front/Access/resetPassword.html"))

// Account
app.get("/account/user", (req,res) => res.sendFile(__dirname + "/Front/Account/userPage.html"))




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

/* usuarioDao.create({
    mail: "mail@mail.com",
    dni: "123",
    contraseña: "muy segura",
    nombre: "gonzalo gonzales",
    nacimiento: "ayer",
    telefono: "123",
    genero: "a",
    planilla: "a"
}) */

/* app.use(express.static(__dirname + "/Home"))
app.get("/registro", (req, res) => {
    res.sendFile(__dirname + "/Front/Sign-up/signUp.html")
}) */