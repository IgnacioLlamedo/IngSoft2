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


//sesion de usuario
const isProduction = false;

app.set("trust proxy", true);

app.use(session({
    name: "cef.sid",

    secret: config.secretoSesion,

    proxy: true,

    resave: false,
    saveUninitialized: false,

    store: MongoStore.create({  //Crea la sesión dentro de mongo db
        mongoUrl: config.cnxStr,
        ttl: 24 * 60 * 60
    }),

    cookie: {
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 12
    }
}));

//Importado de rutas
import { webRouter } from './routes/web/web.router.js';


app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
    console.log(`http://localhost:${config.port}/`)
    console.log(`${config.link}`)
})

app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'Front'));

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

// Access USE
app.use('/api', apiRouter);

app.use(webRouter);
