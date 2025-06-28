import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { ConflictRequestError, NotFoundError, BadRequestError } from "../handler/error-response.js";
import nodemailer from "nodemailer";

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const JWT_ACCESS_EXPIRES = '1h';
const JWT_REFRESH_EXPIRES = '7d';

class AuthService {
  // Đăng ký user mới
  async register(userData) {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new ConflictRequestError("User already exists with this email");
    }
    const user = new User(userData);
    await user.save();
    return this._createToken(user);
  }

  // Đăng nhập
  async login(email, password) {
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      throw new ConflictRequestError("Invalid email or password");
    }
    return this._createToken(user);
  }

  // Tạo accessToken + refreshToken
  _createToken(user) {
    const payload = {
      id: user._id,
      username: user.username,
      role: user.role
    };
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_ACCESS_EXPIRES });
    const refreshToken = jwt.sign(payload, JWT_SECRET_KEY, { expiresIn: JWT_REFRESH_EXPIRES });

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
    };
  }

  // Xử lý refresh token
  async refreshToken(token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET_KEY);
      const user = await User.findById(payload.id);
      if (!user) {
        throw new NotFoundError("User not found");
      }
      return this._createToken(user);
    } catch (error) {
      throw new ConflictRequestError("Invalid refresh token");
    }
  }

  /**
   * Quên mật khẩu: tạo reset token và gửi email
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });
    if (!user) throw new NotFoundError("Email không tồn tại");

    // Tạo token reset và lưu
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Cấu hình gửi mail
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    });

    // Link reset
    const resetURL = `${process.env.FRONTEND_URL}/reset-password.html?token=${resetToken}`;
    await transporter.sendMail({
      from: `"No Reply" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Password Reset',
      html: `
        <p>Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.</p>
        <p>Nhấn vào link bên dưới để đặt lại mật khẩu (hết hạn trong 1 giờ):</p>
        <a href="${resetURL}">${resetURL}</a>
      `
    });

    return { message: 'Email đặt lại mật khẩu đã được gửi' };
  }

  /**
   * Đặt lại mật khẩu dựa vào token
   */
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) throw new BadRequestError("Token không hợp lệ hoặc đã hết hạn");

    // Cập nhật mật khẩu và xoá token
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Trả về token mới
    return this._createToken(user);
  }
}

export default new AuthService();
