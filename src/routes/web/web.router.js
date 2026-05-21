import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { homeRoutes } from "../../constantes/routes.js";

export const webRouter = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));


// Req de Datos
webRouter.get("/session-data", (req, res) => {

    if(!req.session.user) {
        return res.json({
            logged: false,
        });
    }

    res.json({
        session: req.session.user,
        logged: true,
    });
});


// Home
webRouter.get("/", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/visitorHomePage.html"));
});

webRouter.get("/home", (req, res) => {

    if(!req.session.user) {
        return res.redirect("/access/login");
    }

    if(req.session.user.rol !== "cliente") {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/userHomePage.html"));
});

webRouter.get("/home-employee", (req, res) => {

    if(!req.session.user) {
        return res.redirect("/access/login");
    }

    if(req.session.user.rol !== "empleado") {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/employeeHomePage.html"));
});

webRouter.get("/home-admin", (req, res) => {

    if(!req.session.user) {
        return res.redirect("/access/login");
    }

    if(req.session.user.rol !== "administrador") {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/adminHomePage.html"));
});

webRouter.get("/home/table", (req, res) => {

    const isIframe = req.headers["sec-fetch-dest"] === "iframe";

    if(!isIframe) {
        return res.status(403).send("Acceso denegado");
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/HomeTabs/table.html"));
});


// Tabs
webRouter.get("/my-activities", (req, res) => {

    if(!req.session.user) {
        return res.redirect("/access/login");
    }

    if(req.session.user.rol !== "cliente") {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/HomeTabs/tabMyActivities.html"));
});

webRouter.get("/test-clases", (req, res) => {

    if(!req.session.user) {
        return res.redirect("/access/login");
    }

    if(req.session.user.rol !== "cliente") {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Home/HomeTabs/testClases.html"));
});


// Access
webRouter.get("/access/register", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/signUp.html"));
});

webRouter.get("/access/login", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/login.html"));
});

webRouter.get("/access/authentication", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/twoFactorAuthentication.html"));
});

webRouter.get("/access/recover-password", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/recoverPassword.html"));
});

webRouter.get("/access/reset-password", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/resetPassword.html"));
});

webRouter.get("/access/auth-pass", (req,res) => {

    if(req.session.user) {
        return res.redirect(homeRoutes[req.session.user.rol]);
    }

    res.sendFile(path.join(__dirname, "../../Front/Access/authPass.html"));
});


// Account

/* webRouter.get("/account/user", (req,res) => {

    res.sendFile(path.join(__dirname, "../../Front/Account/profile.html"));
}); */

/* app.get("/account/user", (req,res) => {
    if(req.session.user) return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/visitorHomePage.html"));
}); */

webRouter.get("/account/client", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/userProfile.html"));
});

webRouter.get("/account/employee", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "empleado") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/employeeProfile.html"));
});

webRouter.get("/account/admin", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "administrador") return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Account/adminProfile.html"));
});

// Navbars
webRouter.get('/userNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/userNav.html')));
webRouter.get('/visitorNav', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/visitorNav.html')));
webRouter.get('/footer', (req, res) => res.sendFile(path.join(__dirname, 'Front/Navbar/footer.html')));
