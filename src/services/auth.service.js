import { ConflictRequestError, NotFoundError } from "../handler/error-response.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import nodemailer from "nodemailer"

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
  // ——— Thêm chức năng quên mật khẩu ———

  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("Email không tồn tại");

    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET_KEY, { expiresIn: '1h' });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
    await user.save({ validateBeforeSave: false });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: +process.env.SMTP_PORT,
      secure: process.env.SMTP_PORT === '465', 
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    const resetURL = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
    await transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: "Reset Password",
      html: `<p>Click link để reset mật khẩu (1 giờ):</p><a href="${resetURL}">${resetURL}</a>`
    });

    return { message: "Email reset mật khẩu đã được gửi!" };
  }

  async resetPassword(token, newPassword) {
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET_KEY);
    } catch {
      throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");
    }

    const user = await User.findOne({
      _id: payload.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return this._createToken(user);
  }

  async changePassword(currentPassword, newPassword, userId) {
    const user = await User.findById(userId).select('+password');
    if (!user || !(await user.comparePassword(currentPassword))) {
      throw new ConflictRequestError("Mật khẩu hiện tại không đúng");
    }
    user.password = newPassword;
    await user.save();
    return { message: "Đổi mật khẩu thành công" };
  }
  
}

export default new AuthService();