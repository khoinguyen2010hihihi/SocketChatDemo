import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import http from 'http'
import { WebSocketServer } from 'ws'
import path from 'path'
import { fileURLToPath } from 'url'
import instanceMongoDB from './config/db.config.js'
import { errorHandler } from './handler/error-handler.js'
import authRouter from './routes/auth.route.js'
import userRouter from './routes/user.route.js'
import messageRouter from './routes/message.route.js'
import { setupWebSocket } from './ws/websocket.js'

dotenv.config()
const app = express()
const PORT = process.env.PORT || 9000

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, '../public')))

app.use('/auth', authRouter)
app.use('/user', userRouter)
app.use('/message', messageRouter)

app.use(errorHandler)

const server = http.createServer(app)
const wss = new WebSocketServer({ server })
setupWebSocket(wss)

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`)
})
