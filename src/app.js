import config from './config.js';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from "connect-mongo";


// Imports Routers /api/..
import { apiRouter } from './routes/api/api.router.js';


const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));

//Conexión con DB
/* await conectarMongo(); */


//sesion de usuario
/* app.use(session({
    secret: "secreto",
    resave: false,
    saveUninitialized: false
})); */

const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", true);

app.use(session({
    name: "cef.sid",

    secret: config.secretoSesion,

    proxy: true,

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({
        mongoUrl: config.cnxStr,
        ttl: 24 * 60 * 60
    }),

    cookie: {
        secure: isProduction,
        sameSite: "none",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

/* app.use((req,res,next)=>{
    console.log(req.method, req.url);
    console.log("COOKIE:", req.headers.cookie);
    console.log("SESSION:", req.session);
    next();
}); */


// Middleware to expose request data globally to all templates
app.use((req, res, next) => {
	res.locals.path = req.path || {};
	// res.locals.requestData = req.body || {};
	// res.locals.user = req.session.user || null;
	next();
});

// Statics
app.use(express.static(path.join(__dirname, "Front/Static"), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
  }
}));


// Routes
export const homeRoute = "/home";
export const profileRoute = "/account";

// Pages
export const profilePages = { 
    cliente: "Front/Account/clientProfile.ejs", 
    empleado: "Front/Account/employeeProfile.ejs", 
    administrador: "Front/Account/adminProfile.ejs",
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
    if(req.session.user) return res.redirect("/home");
    res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { userRole: "visitor"});
    // res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { param1: "value1" });
});

app.get(homeRoute, (req, res) => {
    if(!req.session.user) return res.redirect("/");
    res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { userRole: req.session.user.rol });
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
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/tabMyActivities.ejs"), { userRole: req.session.user.rol });
});


app.get("/test-clases", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoutes[req.session.user.rol]);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/testClases.ejs"), { userRole: req.session.user.rol });
});


// Access GET
app.get("/access/register", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/signUp.ejs"), { userRole: "visitor" });
});

app.get("/access/login", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/login.ejs"), { userRole: "visitor" })
});

app.get("/access/authentication", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/twoFactorAuthentication.ejs"), { userRole: "visitor" })
});

app.get("/access/recover-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/recoverPassword.ejs"), { userRole: "visitor" })
});

app.get("/access/reset-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/resetPassword.ejs"), { userRole: "visitor" });
});

app.get("/access/auth-pass", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/authPass.ejs"), { userRole: "visitor" });
});


// Access USE
app.use('/api', apiRouter);


// Profile
app.get("/account", (req,res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user) res.render(path.join(__dirname, profilePages[req.session.user.rol]), { userRole: req.session.user.rol });
});

// Navbars
// app.get('/userNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/clientNav.html')));
// app.get('/visitorNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/visitorNav.html')));
// app.get('/footer', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/footer.html')));

