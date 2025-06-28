import Message from "../models/message.model.js"
import mongoose from "mongoose"

class MessageService {
  async getMessagesBetween(userId1, userId2) {
    console.log('userId1:', userId1)
    console.log('userId2:', userId2)
    return await Message.find({
      $or: [
        {
          sender: new mongoose.Types.ObjectId(userId1),
          receiver: new mongoose.Types.ObjectId(userId2)
        },
        {
          sender: new mongoose.Types.ObjectId(userId2),
          receiver: new mongoose.Types.ObjectId(userId1)
        }
      ]
    })
    .populate('sender', 'username')
    .sort({ timestamp: 1 })
  }
}

export default new MessageService()