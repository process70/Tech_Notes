const mongoose  = require("mongoose");
const { Schema, model}  = require("mongoose");
const autoIncrement = require("mongoose-sequence")(mongoose)

const noteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
},
    
   {
    // mongodb set automatically createdAt and updatedAt properties for each created note
    timestamps: true
   }
)

// a secrete collection named counter will be created
noteSchema.plugin(autoIncrement, {
    // create a field named ticket inside the note schema
    inc_field: "ticket",
    id: 'ticketNum',
    start_seq: 500

})

module.exports = model("notes", noteSchema);