import config from './config.js'
import express from 'express'

const app = express()

app.listen(config.port, () => {
    console.log(`Listening in port ${config.port}`)
})

console.log("aaaaaa")