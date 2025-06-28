import userService from '../services/user.service.js'
import { OK, CREATED } from '../handler/success-response.js'
import { AuthFailureError, ConflictRequestError, NotFoundError } from '../handler/error-response.js'
import jwt from 'jsonwebtoken'

class UserController {
  createUser = async (req, res) => {
    const user = await userService.createUser(req.body)
    res.status(201).json(new CREATED({
      message: 'User created successfully',
      metadata: user
    }))
  }

  getUser = async (req, res) => {
    const user = await userService.getUserById(req.params.id)
    if (!user) {
      return res.status(404).json(new NotFoundError('User not found', 'Failed to retrieve user'))
    }
    res.status(200).json(new OK({
      message: 'User retrieved successfully',
      metadata: user
    }))
  }

  getAllUsers = async (req, res) => {
    const users = await userService.getAllUsers()
    res.status(200).json(new OK({
      message: 'Users retrieved successfully',
      metadata: users
    }))
  }

  updateUser = async (req, res) => {
    const user = await userService.updateUser(req.params.id, req.body)
    if (!user) {
      return res.status(404).json(new NotFoundError('User not found', 'Failed to update user'))
    }
    res.status(200).json(new OK({
      message: 'User updated successfully',
      metadata: user
    }))
  }

  deleteUser = async (req, res) => {
    const user = await userService.deleteUser(req.params.id)
    if (!user) {
      return res.status(404).json(new NotFoundError('User not found', 'Failed to delete user'))
    }
    res.status(200).json(new OK({
      message: 'User deleted successfully',
      metadata: null
    }))
  }

  getMe = async (req, res) => {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json(new AuthFailureError('Authorization header is missing or invalid'))
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    const user = await userService.getUserById(decoded.id)
    if (!user) {
      return res.status(404).json(new NotFoundError('User not found', 'Failed to retrieve user'))
    }

    res.status(200).json(new OK({
      message: 'User retrieved successfully',
      metadata: user
    }))
  }

  updateMe = async (req, res) => {
    try {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json(new AuthFailureError('Authorization header is missing or invalid'))
      }

      const token = authHeader.split(' ')[1]
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

      const updatedUser = await userService.updateUser(decodedToken.id, req.body)

      if (!updatedUser) {
        return res.status(404).json(new NotFoundError('User not found', 'Failed to update user'))
      }

      res.status(200).json(new OK({
        message: 'Profile updated successfully',
        metadata: updatedUser
      }))
    } catch (error) {
      console.error('updateMe error:', error)
      res.status(500).json({
        status: 'error',
        message: error.message
      })
    }
  }
}

export default new UserController()