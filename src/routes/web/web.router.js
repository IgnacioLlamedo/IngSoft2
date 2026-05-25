import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { homeRoutes } from "../../constantes/routes.js";

export const webRouter = express.Router();

const __dirname = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../"
);

export const homeRoute = "/home";

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
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { userRole: "visitor"});
    // res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { param1: "value1" });
});

webRouter.get(homeRoute, (req, res) => {

    if(!req.session.user)
        return res.redirect("/");

    res.render("Home/homePage", {
        userRole: req.session.user.rol
    });
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

/* webRouter.get("/home-employee", (req, res) => {

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
}); */

webRouter.get("/home/table", (req, res) => {
    // Solución temporal para que no puedan poner la ruta en el navegador.
    const isIframe = req.headers["sec-fetch-dest"] === "iframe";
    if(!isIframe)
        return res.status(403).send("Acceso denegado");
    //

    res.sendFile(path.join(__dirname, "Front/Home/HomeTabs/table.html"));
});

// Tabs
webRouter.get("/my-activities", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/tabMyActivities.ejs"), { userRole: req.session.user.rol });
});

webRouter.get("/test-clases", (req, res) => {
    if(!req.session.user) return res.redirect("/access/login");
    if(req.session.user.rol !== "cliente") return res.redirect(homeRoutes[req.session.user.rol]);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/testClases.ejs"), { userRole: req.session.user.rol });
});


// Access
webRouter.get("/access/register", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/signUp.ejs"), { userRole: "visitor" });
});

webRouter.get("/access/login", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/login.ejs"), { userRole: "visitor" })
});

webRouter.get("/access/authentication", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/twoFactorAuthentication.ejs"), { userRole: "visitor" })
});

webRouter.get("/access/recover-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/recoverPassword.ejs"), { userRole: "visitor" })
});

webRouter.get("/access/reset-password", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/resetPassword.ejs"), { userRole: "visitor" });
});

webRouter.get("/access/auth-pass", (req,res) => {
    if(req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/authPass.ejs"), { userRole: "visitor" });
});


// Account

/* webRouter.get("/account/user", (req,res) => {

    res.sendFile(path.join(__dirname, "../../Front/Account/profile.html"));
}); */

/* app.get("/account/user", (req,res) => {
    if(req.session.user) return res.redirect(profileRoutes[req.session.user.rol]);
    res.sendFile(path.join(__dirname, "Front/Home/visitorHomePage.html"));
}); */

/* webRouter.get("/account/client", (req, res) => {
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
}); */

webRouter.get("/account", (req,res) => {
    if(!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, profilePages[req.session.user.rol]), { userRole: req.session.user.rol });
});

// Navbars
/* webRouter.get('/userNav', (req, res) => res.sendFile(path.join(__dirname, "../../Front/Navbar/userNav.html")));
webRouter.get('/visitorNav', (req, res) => res.sendFile(path.join(__dirname, "../../Front/Navbar/visitorNav.html")));
webRouter.get('/footer', (req, res) => res.sendFile(path.join(__dirname, "../../Front/Navbar/footer.html"))); */

// Payment
webRouter.get("/payment/approved", (req,res) => {
    if(!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentApproved.ejs"), { userRole: req.session.user.rol });
});

webRouter.get("/payment/failure", (req,res) => {
    if(!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentFailure.ejs"), { userRole: req.session.user.rol });
});

webRouter.get("/payment/pending", (req,res) => {
    if(!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentPending.ejs"), { userRole: req.session.user.rol });
});
