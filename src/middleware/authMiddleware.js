import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { AuthFailureError, ConflictRequestError, NotFoundError } from '../handler/error-response.js'

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json(new AuthFailureError('Authorization header is missing or invalid'))
  }

  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findById(decoded.id).select('-password')
  if (!user) {
    return res.status(404).json(new NotFoundError('User not found', 'Failed to retrieve user'))
  }

  req.user = user
  next()
}

export const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json(new AuthFailureError('Access denied: Admins only'))
  }
  next()
}