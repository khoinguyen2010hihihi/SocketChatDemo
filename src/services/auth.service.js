import { ConflictRequestError, NotFoundError } from "../handler/error-response.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY
const JWT_ACCESS_EXPIRES = '1h'
const JWT_REFRESH_EXPIRES = '7d'

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      throw new ConflictRequestError("User already exists with this email")
    }
    const user = new User(userData)
    await user.save()
    return this._createToken(user)
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select("+password")
    if (!user || !(await user.comparePassword(password))) {
      throw new ConflictRequestError("Invalid email or password")
    }
    return this._createToken(user)
  }

  _createToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    }
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES })
    const refreshToken = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: JWT_REFRESH_EXPIRES })

    return {
      accessToken,
      refreshToken,
      expiresIn: JWT_ACCESS_EXPIRES,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    }
  }

  async refreshToken(token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET_KEY)
      const user = await User.findById(payload.id)
      if (!user) {
        throw new NotFoundError("User not found")
      }
      return this._createToken(user)
    } catch (error) {
      throw new ConflictRequestError("Invalid refresh token")
    }
  }
}

export default new AuthService()