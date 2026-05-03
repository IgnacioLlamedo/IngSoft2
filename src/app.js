import config from './config.js'
import express from 'express'
import nodemailer from 'nodemailer'
import { usuarioDao } from './daos/index.js'

const app = express()

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
        const info = await transporter.sendMail(mailOptions)
    
console.log("aaaaaa")

usuarioDao.create({
    mail: "mail@mail.com",
    dni: "123",
    contraseña: "muy segura",
    nombre: "gonzalo gonzales",
    nacimiento: "ayer",
    telefono: "123",
    genero: "a",
    planilla: "a"
})