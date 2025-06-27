import { ConflictRequestError, NotFoundError } from "../handler/error-response.js"
import User from "../models/user.model.js"

class UserService {
  async createUser(userData) {
    const existingUser = await User.findOne({ email: userData.email })
    if (existingUser) {
      throw new ConflictRequestError("User already exists with this email")
    }
    const user = new User(userData)
    await user.save()
    return user
  }

  async getUserById(userId) {
    return await User.findById(userId).select("-password")
  }

  async getUserByEmail(email) {
    return await User.findOne({ email }).select("-password")
  }

  async updateUser(userId, updateData) {
    delete updateData.role

    if (updateData.password) {
      const existingUser = await User.findById(userId)
      if (!existingUser) {
        throw new NotFoundError("User not found")
      }
      existingUser.username = updateData.username || existingUser.username
      existingUser.email = updateData.email || existingUser.email
      existingUser.password = updateData.password || existingUser.password
      existingUser.role = updateData.role || existingUser.role
      await existingUser.save()
      return existingUser
    } else {
      return User.findByIdAndUpdate(id, updateData, { new: true, runValidators: true }).select("-password")
    }
  }


  async deleteUser(userId) {
    return await User.findByIdAndDelete(userId);
  }

  async getAllUsers() {
    return await User.find().select("-password")
  }
}

export default new UserService()