const asyncHandler = require("express-async-handler")
const Note = require("../models/Note")
const User = require("../models/User")

const getAllNotes = asyncHandler(async (req, res) => {
    // The lean() method is used to return plain JavaScript objects instead of Mongoose documents.   
    const notes = await Note.find().lean()
    if(!notes.length) 
        return res.status(400).json({message: 'no notes found'})
    
    // waits for all the asynchronous operations to complete before assigning the result to notesWithUser
    // sending the response with the actual usernames added to the data
    const notesWithUser = notes.map(async (note) => {
        const user = await User.findById(note.user)
        note.username = user.username
        //returning the edited note
        return note
    })
    res.json(notesWithUser)
})

const createNote = asyncHandler(async (req, res) => {
    const {user, title, text} = req.body
    // check these fields if there are defined and not empty
    if(!user || !title || !text) 
        return res.status(400).json({message: 'all fields are required'})
    
    // check the user
    // exec() ensures that the findById query is executed and returns a true Promise
    
    // check for duplicate title notes
    // const existTitleNote  = await Note.findOne({title}).lean().exec() do the same as below
    const existTitleNote  = await Note.findOne({title: title})
    if(existTitleNote) 
        return res.status(409).json({message: "title already taken by another note"})   
    
    // create a new note
    const noteCreated = await Note.create({user, title, text})
    if(!noteCreated) 
        return res.status(400).json({message: 'error occured while creating a note'})
    return res.status(200).json({message: 'new note created'})
})

const updateNote = asyncHandler(async (req, res) => {
    const { id, user, title, text, completed } = req.body

    // Confirm data
    if (!id || !user || !title || !text || typeof completed !== 'boolean') {
        return res.status(400).json({ message: 'All fields are required' })
    }

    // Confirm note exists to update
    const note = await Note.findById(id)

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    // Check for duplicate title
    const duplicate = await Note.findOne({ title }).lean().exec()

    // Allow renaming of the original note 
    if (duplicate && duplicate?._id.toString() !== id) {
        return res.status(409).json({ message: 'Duplicate note title' })
    }

    note.user = user
    note.title = title
    note.text = text
    note.completed = completed

    console.log("edited note : "+note)
    const updatedNote = await note.save()

    res.json(`${updatedNote.title} updated`)
})

// @desc Delete a note
// @route DELETE /notes
// @access Private
const deleteNote = asyncHandler(async (req, res) => {
    const { id } = req.body

    // Confirm data
    if (!id) {
        return res.status(400).json({ message: 'Note ID required' })
    }

    // Confirm note exists to delete 
    const note = await Note.findById(id).exec()

    if (!note) {
        return res.status(400).json({ message: 'Note not found' })
    }

    const result = await note.deleteOne()

    const reply = `Note '${result.title}' with ID ${result._id} deleted`

    res.json(reply)
})

module.exports = {getAllNotes, createNote, updateNote, deleteNote}
