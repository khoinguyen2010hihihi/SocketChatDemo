import jwt from 'jsonwebtoken';
import Message from '../models/message.model.js';
import User from '../models/user.model.js';

const clients = new Map();

export const setupWebSocket = (server) => {
  server.on('connection', (ws, req) => {
    // Get token from URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4000, 'Token is required');
      return;
    }

    let userId = null;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.id;

      clients.set(userId, ws);
      console.log(`User ${userId} connected`);
    } catch (error) {
      ws.close(4001, 'Invalid token');
      console.error('WebSocket connection error:', error);
      return;
    }

    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message)

        const newMsg = await  Message.create({
          sender: userId,
          receiver: data.receiver,
          content: data.content
        })

        const toSocket = clients.get(data.to)
        if(toSocket && toSocket.readyState === 1) {
          toSocket.send(JSON.stringify({
            from: userId,
            content: newMsg.content,
            timestamp: newMsg.timestamp,
          }))
        }
      } catch (error) {
        console.error('Error handling message:', error);
        ws.send(JSON.stringify({ error: 'Failed to process message' }));
      }
    })

    ws.on('close', () => {
      clients.delete(userId);
      console.log(`User ${userId} disconnected`);
    })
  })
}