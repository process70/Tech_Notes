const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const register = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { username, password, confirmPassword} = req.body
    
    if(!username || !password || !confirmPassword) {
        return res.status(400).json({message: 'all fields are required'})
    }

    const duplicate = await User.findOne({username}).exec()
    // status 409 stands for Conflict
    if(duplicate) return res.status(409).json({message: 'duplicate username'})

    if(password !== confirmPassword) return res.status(409).json({message: 'password does not match'})
    
    const newUser = {
        username,
        password:  await bcrypt.hash(password, 10),
        roles: ["Employee"]
    }
    const createdUser = await User.create(newUser) //best practices for creating a new user
    
    if(createdUser) res.status(200).json({createdUser})
    else return res.status(400).json({message: 'unable to create user'})
})

const login = asyncHandler(async(req, res) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({ message: 'All fields are required' })
    }

    const foundUser = await User.findOne({ username }).exec()

    console.log({foundUser})

    if (!foundUser || !foundUser.active) return res.status(401).
                json({ message: 'Unauthorized, unbale to generate the token, user is not found' })
    

    const match = await bcrypt.compare(password, foundUser.password)

    if (!match) return res.status(401).
                json({ message: 'Unauthorized, unabale to generate the token, wrong password, check your password' })

    // need on each authenticated request(add, update, delete)
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )

    // need to create a new access token for each request that need access token
    const refreshToken = jwt.sign(
        { "username": foundUser.username },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    // Create secure cookie with refresh token 
    res.cookie('jwt', refreshToken, {
        //accessible only by web server, not accessible via client side script
        httpOnly: true,
        secure: true, //https
        sameSite: 'None', //cross-site cookie 
        maxAge: 7 * 24 * 60 * 60 * 1000 //cookie expiry 7 days: set to match rT 
    })

    // Send accessToken containing username and roles 
    // This is the object shorthand notation in JavaScript
    // variable name is the same as the key
    res.json({ accessToken })
})

const refresh = (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized, refresh token required' })

    const refreshToken = cookies.jwt
    
    // decode the token 
    jwt.verify( refreshToken, process.env.REFRESH_TOKEN_SECRET, asyncHandler(async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden, Token expired' })

            // refreshToken does not have UserInfo like accessToken
            const foundUser = await User.findOne({ username: decoded.username })

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized, user not found' })

            const accessToken = jwt.sign(
                { "UserInfo": {  "username": foundUser.username,  "roles": foundUser.roles }},
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({accessToken:  accessToken, user: foundUser.username })
        })
    )
}

const logout = (req, res) => {
    const {jwt} = req.cookies
    if (!jwt) return res.sendStatus(204) // No content, when you want to send the status without content
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true })
    res.status(200).json({ message: 'Cookie cleared' })
    console.log('loggin out')
}

module.exports = {register, login, logout, refresh}
