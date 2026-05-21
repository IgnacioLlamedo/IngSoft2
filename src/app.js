import config from './config.js';
import express from 'express';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import MongoStore from "connect-mongo";


// Imports Routers /api/..
import { apiRouter } from './routes/api/api.router.js';
import { webRouter } from './routes/web/web.router.js';


const app = express()
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

app.use(express.json());

//sesion de usuario
const isProduction = process.env.NODE_ENV === "production";

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
        sameSite: "none",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
}));

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

export default app;