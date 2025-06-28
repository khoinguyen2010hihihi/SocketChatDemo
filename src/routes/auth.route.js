import express from 'express'
import authController from '../controllers/auth.controller.js'
import asyncHandler from '../middleware/asyncHandle.js'
import { authMiddleware } from '../middleware/authMiddleware.js'; 

const router = express.Router()

router.post('/register', asyncHandler(authController.register))
router.post('/login', asyncHandler(authController.login))
router.post('/refresh-token', asyncHandler(authController.refreshToken))
router.post('/logout', asyncHandler(authController.logout))

router.post('/forgot-password', asyncHandler(authController.forgotPassword))
router.post('/reset-password', asyncHandler(authController.resetPassword))
router.post('/change-password', authMiddleware, asyncHandler(authController.changePassword))
export default router