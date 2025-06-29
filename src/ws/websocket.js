import jwt from 'jsonwebtoken'
import Message from '../models/message.model.js'
import User from '../models/user.model.js'

const clients = new Map()

export const setupWebSocket = (server) => {
  server.on('connection', (ws, req) => {
    // Get token from URL
    const url = new URL(req.url, `http://${req.headers.host}`)
    const token = url.searchParams.get('token')

    if (!token) {
      ws.close(4000, 'Token is required')
      return
    }

    let userId = null

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      userId = decoded.id

      clients.set(userId, ws)
      console.log(`User ${userId} connected`)
    } catch (error) {
      ws.close(4001, 'Invalid token')
      console.error('WebSocket connection error:', error)
      return
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message)
        const {
          to,
          content
        } = data

        if (!to || !content) {
          ws.send(JSON.stringify({
            error: 'Invalid message format'
          }))
          return
        }

        const newMsg = await Message.create({
          sender: userId,
          receiver: to,
          content: content
        })

        const senderUser = await User.findById(userId)

        const toSocket = clients.get(to)
        if (toSocket && toSocket.readyState === 1) {
          toSocket.send(JSON.stringify({
            fromId: userId,
            fromUsername: senderUser.username,
            content: newMsg.content,
            timestamp: newMsg.timestamp
          }))
        }

        const fromSocket = clients.get(userId)
        if (fromSocket && fromSocket.readyState === 1) {
          fromSocket.send(JSON.stringify({
            fromId: userId,
            fromUsername: senderUser.username,
            content: newMsg.content,
            timestamp: newMsg.timestamp
          }))
        }

        if (ws.readyState === 1) {
          ws.send(JSON.stringify({
            fromId: userId,
            fromUsername: 'You',
            content: newMsg.content,
            timestamp: newMsg.timestamp
          }))
        }

      } catch (error) {
        console.error('Error handling message:', error)
        ws.send(JSON.stringify({
          error: 'Failed to process message'
        }))
      }
    })


    ws.on('close', () => {
      clients.delete(userId)
      console.log(`User ${userId} disconnected`)
    })
  })
}