const projectModel = require("../models/project")
const reportModel = require("../models/analysisReport")

async function getInterviewMode(req,res) {
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

    res.status(200).json({
        interview : {
            project : {
                id : project._id,
                name : project.name
            },
            explanations : report.projectExplanations,
            questions : report.interviewQuestions,
            architecture : report.architecture,
            authentication : report.authentication,
            database : report.database,
            apis : report.apis
        }
    })
}

module.exports = {
    getInterviewMode
}

