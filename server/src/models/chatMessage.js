const mongoose = require("mongoose")

const chatMessageSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    project : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Project",
        required : true
    },
    question : String,
    answer : String
},{timestamps : true})

module.exports = mongoose.model("ChatMessage",chatMessageSchema)

