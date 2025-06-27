import express from 'express'
import authController from '../controllers/auth.controller.js'
import asyncHandler from '../middleware/asyncHandle.js'

const router = express.Router()

router.post('/register', asyncHandler(authController.register))
router.post('/login', asyncHandler(authController.login))
router.post('/refresh-token', asyncHandler(authController.refreshToken))
router.post('/logout', asyncHandler(authController.logout))

export default router