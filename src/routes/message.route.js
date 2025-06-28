import express from 'express'
import messageController from '../controllers/message.controller.js'
import asyncHandler from '../middleware/asyncHandle.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/:receiverId', authMiddleware, asyncHandler(messageController.getMessages))

export default router