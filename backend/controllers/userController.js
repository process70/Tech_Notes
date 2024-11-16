const Note = require("../models/Note")
const User = require('../models/User')
const asyncHandler = require("express-async-handler")
const bcrypt = require("bcrypt")

const getAllUsers = asyncHandler(async (req, res) => {
    // select(): Specifies which document fields to include or exclude.
    const users = await User.find().select("-password")
    
    if(!users?.length) return res.status(400).json({message: 'no users found'})
    return res.status(200).json(users)
})

const getUser = asyncHandler(async (req, res, next) => {

})
const createUser = asyncHandler(async (req, res) => {
    console.log(req.body)
    const { username, password, roles } = req.body
    
    if(!username || !password || !Array.isArray(roles) || roles.length === 0) {
        return res.status(400).json({message: 'all fields are required'})
    }

    const duplicate = await User.findOne({username}).exec()
    // status 409 stands for Conflict
    if(duplicate) return res.status(409).json({message: 'duplicate username'})
    
    const newUser = {
        username,
        password:  await bcrypt.hash(password, 10),
        roles
    }
    const createdUser = await User.create(newUser) //best practices for creating a new user
    
    if(createUser) res.status(200).json(createdUser)
    else return res.status(400).json({message: 'unable to create user'})
})

const updateUser = asyncHandler(async (req, res) => {
    const {id, username, password, roles, active} = req.body
    if(!username || !Array.isArray(roles) || !roles.length === 0 || typeof active !== 'boolean') {
        return res.status(400).json({message: 'all fields are required'})
    }
    // The .lean() method is a Mongoose-specific function that tells Mongoose to skip instantiating 
    // a full Mongoose document and instead give you a plain JavaScript object.
    // exec() function enable us to use save function to update
    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({message: 'user not found'})

    // check for duplicate
    // parameter inside findOne must be an object
    // lean is used if we don't want to get back the document
    const duplicate = await User.findOne({username}).lean().exec()
    if(duplicate && duplicate._id.toString() !== id) 
        return res.status(409).json({message: 'duplicate username'})
    
    // we need to check if the user provide a password because
    // we send user data without password (select("-password"))
    if(password) user.password =  await bcrypt.hash(password, 10)

    user.username = username
    user.roles = roles
    user.active = active

    const updatedUser = await user.save() //best practices for updating user
    if(updatedUser) res.status(200).json(updatedUser)
    else return res.status(400).json({message: 'unable to update user'})

})
const deleteUser = asyncHandler(async (req, res) => {
    const {id} = req.body
    
    if(!id) return res.status(400).json({message: "user id is required"})

    //getting the user's notes if exist
    const notes = await Note.findOne({user: id}).lean()
    if(notes) return res.status(400).json({message: 'user has assigned notes'})

    const user = await User.findById(id)
    if(!user) return res.status(400).json({message: 'user not found'})

    const deletedUser = await User.findByIdAndDelete(id)
    if(!deletedUser) return res.status(400).json({message: 'unable to delete the user'})

    res.status(200).json({message: `username ${deletedUser.username} and Id ${deletedUser._id} deleted`})
})
module.exports = {getAllUsers, getUser, createUser, updateUser, deleteUser}