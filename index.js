import express from 'express'
import dotenv from 'dotenv'
import { DatabaseConnector } from './db/db.js'

import cors from 'cors'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 2001

app.use(express.json());


app.use(cors({
    origin: '*', //Allow frontend link here
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.get('/', (req, res) => {
    res.send('Hello World!')
})