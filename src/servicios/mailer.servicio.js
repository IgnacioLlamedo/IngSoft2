import config from '../config.js';
import nodemailer from 'nodemailer';

class mailService{
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
    async auth(mail, codigo){
        const body = `
        <h1>Código de verificación CEF</h1>
        <p>Tu código es: ${codigo}</p>
        `
        await this.send(mail, 'Código de verificación CEF', body)
    }
}

export const mailer = new mailService()


