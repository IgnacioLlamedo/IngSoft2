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

    async clientAuth(mail, nombre, codigo) {
        const imgUrl = "https://res.cloudinary.com/dk6gvpuys/image/upload/v1781481259/Logo-mini_bzbhny.png";
        const verifyUrl = `http://localhost:8080/access/authentication?mail=${mail}`;

        const body = `
            <div style="display: flex; justify-content: center; align-items: flex-end;">
                <img src="${imgUrl}" style="width: 64px; height: 64px; margin-right: 10px" alt="Logo de CEF"/>
                <h2 style="text-align: center; font-size: 25px">CEF - Verificar cuenta</h2>
            </div>
            <hr>
            <p style="font-size: 20px; font-weight: bold">¡Bienvenido a CEF, <span style="font-style: italic">${nombre}</span>!</p>
            <br/>
            <p>Ya está casi todo listo. Para completar el registro, introducí el siguiente código en la página que estabas viendo:</p>
            <br/> 
            <p><span style="font-weight: bold; font-size: 20px; color: #ff3232; text-align: center">${codigo}</span></p>
            <br/>
            <p>Si perdiste la página de verificación, podés acceder a ella pulsando el siguiente enlace:</p>
            <br/>
            <p><a href="${verifyUrl}" target="_blank" style="font-size: 15px">Verificar cuenta</a></p>
            <br/>  
            <br/>
            <p style="text-align: center; font-size: 11px; color: #797979">© 2026 CEF Servicios • Todos los derechos reservados.</p>
        `;
        await this.send(mail, 'Código de verificación - CEF', body)
    }

    async employeeAuth(user) {
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
    
    async cancelledClass(mail, nombre, fecha) {
        const imgUrl = "https://res.cloudinary.com/dk6gvpuys/image/upload/v1781481259/Logo-mini_bzbhny.png";
        // const extra = "... ¿Nos perdonás? 🥺"; // para casos de emergencia

        const body = `
            <div style="display: flex; justify-content: center; align-items: flex-end;">
                <img src="${imgUrl}" style="width: 64px; height: 64px; margin-right: 10px" alt="Logo de CEF"/>
                <h2 style="text-align: center; font-size: 25px">CEF - Clase cancelada</h2>
            </div>
            <hr>
            <p>Hola, <b>${nombre}</b>. Lamentamos informarte que debido a inconvenientes con nuestro personal, la clase asignada a la fecha <b>${fecha}</b> ha sido cancelada.</p><br/>
            <br/>
            <p>Te invitamos a acercarte a nuestra sede para coordinar una devolución de dinero o reintegro de créditos en tu suscripción.</p><br/>
            <br/>
            <p>Lamentamos las molestias que esto pueda ocasionar, atte. El equipo de CEF.</p><br/>
            <br/>
            <p style="text-align: center; font-size: 11px; color: #797979">© 2026 CEF Servicios • Todos los derechos reservados.</p>
        `;

        await this.send(user.mail, `Clase cancelada (${fecha}) - CEF`, body);        
    }
}




export const mailer = new mailService()


