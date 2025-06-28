import messageService from "../services/message.service.js"

class MessageController {
  getMessages = async (req, res) => {
    const {
      userId
    } = req
    const {
      receiverId
    } = req.params

    const messages = await messageService.getMessagesBetween(userId, receiverId)

    res.status(200).json({
      status: "success",
      metadata: messages
    })
  }
}

export default new MessageController()