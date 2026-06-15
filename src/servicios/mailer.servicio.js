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
        
        console.log('mailOptions', mailOptions);
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

    async employeeAuth(user){
        const imgUrl = "https://res.cloudinary.com/dk6gvpuys/image/upload/v1781481259/Logo-mini_bzbhny.png";
        const verifyUrl = `http://localhost:8080/access/employee-auth?code=${user.codigo}`;
        const fechaNac = new Date(user.nacimiento).toLocaleString().split(',')[0];

        const body = `
            <div style="display: flex; justify-content: center; align-items: flex-end;">
                <img src="${imgUrl}" style="width: 64px; height: 64px; margin-right: 10px" alt="Logo de CEF"/>
                <h2 style="text-align: center; font-size: 25px">CEF - Verificar cuenta de empleado</h2>
            </div>
            <hr>
            <p>Bienvenido al sistema de gestión de CEF, fuiste registrado con los siguientes datos:</p><br/>
            <p>
                • Correo: ${user.mail}<br/>
                • Nombre completo: ${user.nombre}<br/>
                • DNI: ${user.dni}<br/>
                • Fecha de nacimiento: ${fechaNac}<br/>
                • Rol: ${user.rol}
            </p><br/>
            <p>
                Para completar el registro, visitá el siguiente enlace y crea tu contraseña.<br/>
                <br/>
                <b><a href="${verifyUrl}" target="_blank">Finalizar registro</a></b>
            </p><br/>
            <p style="text-align: center; font-size: 11px; color: #797979">© 2026 CEF Servicios • Todos los derechos reservados.</p>
        `;

        await this.send(user.mail, 'Finalizar registro de empleado - CEF', body);
    }
}

export const mailer = new mailService()


