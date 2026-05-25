import dotenv from 'dotenv';

dotenv.config()

export default {
    cnxStr:process.env.MONGO_CNX_STR,
    port:process.env.PORT,
    mailUser:process.env.EMAIL_USER,
    mailPass:process.env.EMAIL_PASS,
    mpAccessToken:process.env.MP_ACCESS_TOKEN,
    secretoSesion:process.env.SESSION_SECRET,
    varEntornoNode:process.env.NODE_ENV,
    link:process.env.LINK,
}