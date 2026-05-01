import dotenv from 'dotenv';

dotenv.config()

export default {
    cnxStr:process.env.MONGO_CNX_STR,
    port:process.env.PORT
}