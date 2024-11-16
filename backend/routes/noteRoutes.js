const express = require("express")
const { createNote, getAllNotes, updateNote, deleteNote } = require("../controllers/noteController")
const noteRouter = express.Router()
const verifyJWT = require("../middleware/verifyJWT")

noteRouter.post("/createNote", verifyJWT, createNote)
noteRouter.get("/getAllNotes", getAllNotes)
noteRouter.patch("/update", verifyJWT, updateNote)
noteRouter.delete("/delete", verifyJWT, deleteNote)


module.exports = noteRouter