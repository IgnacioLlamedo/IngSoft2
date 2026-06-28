import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Role, Status } from "../../constants/constants.js";
import { usuarioDao, empleadoDao } from "../../daos/index.js";

export const webRouter = express.Router();

const __dirname = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    "../../"
);

// Routes
export const rootRoute = "/";
export const homeRoute = "/home";
export const profileRoute = "/account";


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
webRouter.get(rootRoute, (req,res) => {
    if (req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/homePage.ejs"), { userRole: Role.VISITOR, Role });
});

webRouter.get(homeRoute, (req, res) => {
	if (!req.session.user) return res.redirect(rootRoute);
	res.render(path.join(__dirname, "Front/Home/homePage.ejs"), {
		userRole: req.session.user.rol,
		Role,
		name: req.session.user.nombre,
	});
});

webRouter.get("/home/table", (req, res) => {
    // Solución temporal para que no puedan poner la ruta en el navegador.
    const isIframe = req.headers["sec-fetch-dest"] === "iframe";
    if (!isIframe) return res.status(403).send("Acceso denegado");
    res.sendFile(path.join(__dirname, "Front/Home/HomeTabs/table.html"));
});

// Tabs
webRouter.get("/my-activities", (req, res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.CLIENT) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/tabMyActivities.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/test-clases", (req, res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.CLIENT) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Home/HomeTabs/testClases.ejs"), { userRole: req.session.user.rol, Role });
});


// Access
webRouter.get("/access/register", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/signUp.ejs"), { userRole: Role.VISITOR, Role });
});

webRouter.get("/access/login", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/login.ejs"), { userRole: Role.VISITOR, Role })
});

webRouter.get("/access/authentication", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/twoFactorAuthentication.ejs"), { userRole: Role.VISITOR, Role })
});

webRouter.get("/access/recover-password", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute); 
    res.render(path.join(__dirname, "Front/Access/recoverPassword.ejs"), { userRole: Role.VISITOR, Role })
});

webRouter.get("/access/reset-password", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/resetPassword.ejs"), { userRole: Role.VISITOR, Role });
});

webRouter.get("/access/auth-pass", (req,res) => {
    if (req.session.user) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Access/authPass.ejs"), { userRole: Role.VISITOR, Role });
});

// Account & Profile
webRouter.get("/account", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    // Debería ser con el ID pero hay un bug con los IDs de los usuarios de prueba
    res.render(path.join(__dirname, "Front/Account/accountPage.ejs"), { userRole: req.session.user.rol, userId: req.session.user.id, Role, Status });
});

webRouter.get("/profile/:id", async (req, res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);

    const user = await usuarioDao.readOne({ _id: req.params.id });
    if (!user) return res.status(404).send("Usuario no encontrado");
    
    res.render(path.join(__dirname, "Front/Account/userProfilePage.ejs"), {
        userRole: user.rol,
        userMail: user.mail,
        userId: user._id,
        Role,
        Status
    });
});


// Payment
webRouter.get("/payment/approved", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentApproved.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/payment/failure", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentFailure.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/payment/pending", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    res.render(path.join(__dirname, "Front/Payment/paymentPending.ejs"), { userRole: req.session.user.rol, Role });
});


// Admin Dropbox
webRouter.get("/management", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN && req.session.user.rol !== Role.EMPLOYEE) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/management.ejs"), { userRole: req.session.user.rol, Role });
});


// Management
webRouter.get("/management/classes", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN && req.session.user.rol !== Role.EMPLOYEE) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/managementClasses.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/management/rooms", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN && req.session.user.rol !== Role.EMPLOYEE) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/managementRooms.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/management/activities", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN && req.session.user.rol !== Role.EMPLOYEE) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/managementActivities.ejs"), { userRole: req.session.user.rol, Role });
});

webRouter.get("/management/instructors", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN && req.session.user.rol !== Role.EMPLOYEE) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/managementInstructors.ejs"), { userRole: req.session.user.rol, Role, Status });
});


// Userlist
webRouter.get("/users/userlist", (req,res) => {
    // capaz por seguridad no conviene exponer que existe la ruta
    // aunque si ahora se muestran las páginas de error...
    // ...para evitar eso mismo, lo más seguro sería mostrar un error 404 en vez de redirigir al login
    if (!req.session.user) return res.redirect("/access/login");    
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Users/userlist.ejs"), { userRole: req.session.user.rol, Role, Status });
});


// Employee Sign Up
webRouter.get("/management/employee-signup", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");    
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Management/managementEmployeeSignUp.ejs"), { userRole: req.session.user.rol, Role, Status });
});

webRouter.get("/access/employee-auth", async (req, res, next) => {
    if (req.session.user) return res.redirect(homeRoute);
    
    const code = req.query.code;
    if (!code) return res.redirect(homeRoute);

    const isValidCode = await empleadoDao.verifyCode(code);
    if (!isValidCode) return next(); // Redirige al manejador del final de la cadena (Error 404 Landing page)

    res.render(path.join(__dirname, "Front/Access/employeeAuth.ejs"), { userRole: Role.VISITOR, Role, Status, code });
});


// Stats Pages
webRouter.get("/stats/billing-period", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");    
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Stats/statsBillingPeriod.ejs"), { userRole: req.session.user.rol, Role, Status });
});

webRouter.get("/stats/subscriptions-activity", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");    
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Stats/statsSubscriptionsActivity.ejs"), { userRole: req.session.user.rol, Role, Status });
});

webRouter.get("/stats/cancellations-class", (req, res) => {
    if (!req.session.user) return res.redirect("/access/login");
    if (req.session.user.rol !== Role.ADMIN) return res.redirect(homeRoute);
    res.render(path.join(__dirname, "Front/Stats/statsCancellationsClass.ejs"), { userRole: req.session.user.rol, Role, Status });
});


// Cupo
webRouter.get("/cupo", (req,res) => {
    if (!req.session.user) return res.redirect("/access/login");    
    if (req.session.user.rol !== Role.CLIENT) return res.redirect(homeRoute);
    // TODO: VALIDAR ID DEL CLIENTE, SÓLO EL CLIENTE INDICADO DEBERÍA PODER INGRESAR A LA PÁGINA.
    res.render(path.join(__dirname, "Front/Cupo/manageCupo.ejs"), { userRole: req.session.user.rol, Role, Status });
});


// Error 404 Landing page
// Acá entra cuando no encuentra ninguna de las rutas de arriba
webRouter.use((req, res, next) => {
    const userRole = req.session.user ? req.session.user.rol : Role.VISITOR;
	res.status(404).render(
		path.join(__dirname, "Front/ErrorPages/errorPage.ejs"),
		{ userRole: userRole, Role },
	);
});