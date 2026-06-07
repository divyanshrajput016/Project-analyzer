const userModel = require("../models/user")
const reportModel = require("../models/analysisReport")
const projectModel = require("../models/project")

async function getUsers(req,res) {
    const users = await userModel.find().select("-password").sort({createdAt : -1})
    res.status(200).json({users})
}

async function getAnalytics(req,res) {
    const totalUsers = await userModel.countDocuments()
    const totalReports = await reportModel.countDocuments()
    const totalProjects = await projectModel.countDocuments()

    res.status(200).json({
        analytics : {
            totalUsers,
            totalReports,
            totalProjects
        }
    })
}

async function deleteAbusiveReport(req,res) {
    const report = await reportModel.findByIdAndDelete(req.params.id)

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    res.status(200).json({message : "Report deleted successfully"})
}

module.exports = {
    getUsers,
    getAnalytics,
    deleteAbusiveReport
}

