const projectModel = require("../models/project")
const reportModel = require("../models/analysisReport")
const chatModel = require("../models/chatMessage")
const {answerRepositoryQuestion} = require("../service/aiService")

async function askRepository(req,res) {
    const {question} = req.body

    if(!question) {
        return res.status(400).json({
            message : "Question is required"
        })
    }

    const project = await projectModel.findOne({_id : req.params.projectId,user : req.user.id})

    if(!project) {
        return res.status(404).json({
            message : "Project not found"
        })
    }

    const report = await reportModel.findOne({project : project._id,user : req.user.id}).sort({version : -1})

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    const answer = await answerRepositoryQuestion(question,report)
    const chat = await chatModel.create({
        user : req.user.id,
        project : project._id,
        question,
        answer
    })

    res.status(201).json({
        message : "Answer generated successfully",
        chat
    })
}

async function getChatHistory(req,res) {
    const chats = await chatModel.find({user : req.user.id,project : req.params.projectId}).sort({createdAt : 1})
    res.status(200).json({chats})
}

module.exports = {
    askRepository,
    getChatHistory
}

