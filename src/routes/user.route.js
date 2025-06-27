import express from 'express'
import userController from '../controllers/user.controller.js'
import asyncHandler from '../middleware/asyncHandle.js';
import { authMiddleware, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router()

router.post('/create', asyncHandler(userController.createUser));
router.put('/updateMe', authMiddleware, asyncHandler(userController.updateMe));
router.get('/me', authMiddleware, asyncHandler(userController.getMe));
router.get('/getAll', authMiddleware, isAdmin, asyncHandler(userController.getAllUsers));
router.get('/:id', authMiddleware, isAdmin, asyncHandler(userController.getUser));
router.put('/:id', authMiddleware, isAdmin, asyncHandler(userController.updateUser));
router.delete('/:id', authMiddleware, isAdmin, asyncHandler(userController.deleteUser));

export default router