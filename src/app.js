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
    cliente: "/", 
    empleado: "/", 
    administrador: "/",
};

export const profileRoutes = { 
    cliente: "/account/client", 
    empleado: "/account/employee", 
    administrador: "/account/admin",
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
    //if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/homePage.html"));
});

/* app.get("/home", (req, res) => {
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
}); */

app.get("/home/table", (req, res) => {
    // Solución temporal para que no puedan poner la ruta en el navegador.
    /* const isIframe = req.headers["sec-fetch-dest"] === "iframe";
    if(!isIframe)
        return res.status(403).send("Acceso denegado"); */
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

app.get("/access/reset-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Access/resetPassword.html"));
});

app.get("/access/auth-pass", (req,res) => {
    if(req.session.user) return res.redirect(homeRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Access/authPass.html"));
});


// Access USE
app.use('/api', apiRouter);


// Profile
app.get("/account/user", (req,res) => {
    if(req.session.user) return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/visitorHomePage.html"));
});

app.get("/account/client", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/userProfile.html"));
});

app.get("/account/employee", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "empleado") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/employeeProfile.html"));
});

app.get("/account/admin", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "administrador") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/adminProfile.html"));
});

// Navbars
app.get('/userHomeNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/userHomeNav.html')));

app.get('/adminNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/adminNav.html')));
app.get('/employeeNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/employeeNav.html')));
app.get('/userNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/userNav.html')));
app.get('/visitorNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/visitorNav.html')));

app.get('/footer', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/footer.html')));

