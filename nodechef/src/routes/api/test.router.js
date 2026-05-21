import express from "express";
import { userAutoLoginController, employeeAutoLoginController, adminAutoLoginController } from "../../controllers/test.controller.js";

export const testRouter = express.Router();

testRouter.post('/user-autologin', userAutoLoginController);
testRouter.post('/employee-autologin', employeeAutoLoginController);
testRouter.post('/admin-autologin', adminAutoLoginController);
