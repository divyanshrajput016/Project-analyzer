const projectModel = require("../models/project")
const reportModel = require("../models/analysisReport")
const chatModel = require("../models/chatMessage")

async function getDashboard(req,res) {
    try {
        const userId = req.user.id

        const totalProjects = await projectModel.countDocuments({user : userId})
        const totalReports = await reportModel.countDocuments({user : userId})
        const recentReports = await reportModel.find({user : userId}).sort({createdAt : -1}).limit(5)
        const savedReports = await reportModel.find({user : userId}).sort({updatedAt : -1}).limit(10)
        const chatHistory = await chatModel.find({user : userId}).sort({createdAt : -1}).limit(8)

        const projects = await projectModel.find({user : userId})
        const totalApisDetected = projects.reduce((sum,item) => sum + (item.totalApis || 0),0)
        const totalModelsDetected = projects.reduce((sum,item) => sum + (item.totalModels || 0),0)
        const securityScores = projects.map(item => item.securityScore || 0)
        const averageSecurityScore = securityScores.length ? Math.round(securityScores.reduce((sum,item) => sum + item,0) / securityScores.length) : 0

        const techStackStatistics = {}
        projects.forEach(project => {
            ;(project.techStack || []).forEach(tech => {
                techStackStatistics[tech] = (techStackStatistics[tech] || 0) + 1
            })
        })

        res.status(200).json({
            stats : {
                totalReports,
                totalApisDetected,
                totalModelsDetected,
                totalProjectsAnalyzed : totalProjects,
                averageSecurityScore
            },
            recentReports,
            savedReports,
            chatHistory,
            securityScores,
            techStackStatistics
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error fetching dashboard"})
    }
}

module.exports = {
    getDashboard
}

