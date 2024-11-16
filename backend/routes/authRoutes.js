const express = require("express")
const authRoutes = express.Router()
const loginLimiter = require("../middleware/loginLimiter")
const { login, logout, refresh } = require("../controllers/authController")

authRoutes.get("/refresh", refresh)
authRoutes.post("/register", register)
authRoutes.post("/login", loginLimiter, login)
authRoutes.post("/logout", logout)

module.exports = authRoutes
