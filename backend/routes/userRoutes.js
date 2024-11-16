const {Router} = require("express")
const { getUser, getAllUsers, createUser, updateUser, deleteUser } = require("../controllers/userController")
const verifyJWT = require("../middleware/verifyJWT")

const userRouter =  Router()

userRouter.get('/getAllUsers', getAllUsers)
userRouter.post('/createUser', verifyJWT, createUser)
userRouter.patch('/update', verifyJWT, updateUser)
userRouter.delete('/delete', verifyJWT, deleteUser)

module.exports = userRouter