import config from './config.js';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { usuarioDao } from './daos/index.js';
import session from 'express-session';
import MongoStore from "connect-mongo";
/* import { conectarMongo } from "./db/mongoose.js"; */

// Imports Routers /api/..
import { apiRouter } from './routes/api/api.router.js';


const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

app.use(express.json());

//Conexión con DB
/* await conectarMongo(); */

//sesion de usuario
app.use(session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false
}));


// Statics
app.use(express.static(path.join(__dirname, "Front/Static"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));


// Routes
export const homeRoutes = { 
    cliente: "/home", 
    empleado: "/home-employee", 
    administrador: "/home-admin",
};


// Req de Datos
app.get("/session-data", (req, res) => {
    if(!req.session.user)
        res.json({  
            logged: false,
        });
        
    else
        res.json({
            session: req.session.user,
            logged: true,
        });
});


// Home
app.get("/", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/visitorHomePage.html"));
});

app.get("/home", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/userHomePage.html"));
});

app.get("/home-employee", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "empleado") return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/employeeHomePage.html"));
});

app.get("/home-admin", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "administrador") return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/adminHomePage.html"));
});

app.get("/home/table", (req, res) => {
    // Solución temporal para que no puedan poner la ruta en el navegador.
    const isIframe = req.headers["sec-fetch-dest"] === "iframe";
    if(!isIframe)
        return res.status(403).send("Acceso denegado");
    //

    res.sendFile(path.join(__dirname, "Front/Home/HomeTabs/table.html"));
});


// Tabs
app.get("/my-activities", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/HomeTabs/tabMyActivities.html"));
});


app.get("/test-clases", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/HomeTabs/testClases.html"));
});


// Access GET
app.get("/access/register", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Access/signUp.html"));
});

app.get("/access/login", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]); 
    res.sendFile(path.join(__dirname, "Front/Access/login.html"))
});

app.get("/access/authentication", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Access/twoFactorAuthentication.html"))
});

app.get("/access/recover-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]); 
    res.sendFile(path.join(__dirname, "Front/Access/recoverPassword.html"))
});


// Access USE
app.use('/api', apiRouter);


// Account
app.get("/account/user", (req,res) => res.sendFile(path.join(__dirname, "Front/Account/profile.html")));


/* class mailer{
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
} */
