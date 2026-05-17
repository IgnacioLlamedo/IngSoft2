
import config from './config.js';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import { usuarioDao } from './daos/index.js';
import session from 'express-session';
import { conectarMongo } from "./db/mongoose.js";

// Imports Routers /api/..
import { apiRouter } from './routes/api/api.router.js';


const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json());
app.use(express.static("src/Front/Home"));
app.use(express.static("src/Front/Profile"));

app.get("/profile", (req, res) => {
    res.sendFile(process.cwd() + "/src/Front/Profile/profile.html");
});

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

app.use(express.json());

//Conexión con DB
await conectarMongo();

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

app.get("/", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/visitorHomePage.html"));
});

// Access GET
app.get("/access/register", (req,res) => res.sendFile(path.join(__dirname, "Front/Access/signUp.html")));
app.get("/access/login", (req,res) => res.sendFile(path.join(__dirname, "Front/Access/login.html")));
app.get("/access/recover-password", (req,res) => res.sendFile(path.join(__dirname, "Front/Access/recoverPassword.html")));
app.get("/access/reset-password", (req,res) => res.sendFile(path.join(__dirname, "Front/Access/resetPassword.html")));

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


// Access USE
app.use('/api', apiRouter)

// Account
app.get("/account/user", (req,res) => res.sendFile(path.join(__dirname, "Front/Account/userPage.html")));


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

<<<<<<< HEAD
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
