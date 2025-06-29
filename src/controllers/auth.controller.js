import authService from "../services/auth.service.js"
import { OK, CREATED } from "../handler/success-response.js"
import { AuthFailureError } from "../handler/error-response.js"

class AuthController {
  register = async (req, res) => {
    const result = await authService.register(req.body)
    res.status(201).json(new CREATED({
      message: "User registered successfully",
      metadata: {
        user: result.user      
      }
    }))
  }

  login = async (req, res) => {
    const { email, password } = req.body
    const result = await authService.login(email, password)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json(new OK({
      message: "Login successful",
      metadata: {
        accessToken: result.accessToken,
        user: result.user
      }
    }))
  }

  refreshToken = async (req, res) => {
    const token = req.cookies.refreshToken
    if (!token) {
      throw new AuthFailureError("Refresh token is required", 401)
    }

    const result = await authService.refreshToken(token)
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json(new OK({
      message: "Token refreshed successfully",
      metadata: {
        accessToken: result.accessToken,
        user: result.user
      }
    }))
  }

  logout = async (req, res) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "Strict"
    })
    res.status(200).json(new OK({
      message: "Logout successful",
      metadata: {}
    }))
  }
  

//---------------------------------------forgot password---------------------------------------//
  forgotPassword = async (req, res) => {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json(new OK({ message: result.message }));
  }

  resetPassword = async (req, res) => {
    const { token, password } = req.body;
    const result = await authService.resetPassword(token, password);
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    res.status(200).json(new OK({
      message: 'Password reset successful',
      metadata: { accessToken: result.accessToken }
    }));
  }
  changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id; 
    const result = await authService.changePassword(currentPassword, newPassword, userId);
    res.status(200).json(new OK({ message: result.message }));
  }
  
}

export default new AuthController()