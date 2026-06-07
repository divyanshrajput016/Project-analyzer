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
        const authenticationTypes = {}
        const languageBreakdown = {}

        const techStackStatistics = {}
        projects.forEach(project => {
            ;(project.techStack || []).forEach(tech => {
                techStackStatistics[tech] = (techStackStatistics[tech] || 0) + 1
            })
            if(project.techStack.includes("JWT")) {
                authenticationTypes.JWT = (authenticationTypes.JWT || 0) + 1
            }
            if(project.language) {
                languageBreakdown[project.language] = (languageBreakdown[project.language] || 0) + 1
            }
        })

        const securityTrend = projects.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt)).map(project => ({
            name : project.name,
            score : project.securityScore || 0,
            date : project.createdAt
        }))

        res.status(200).json({
            stats : {
                totalReports,
                totalApisDetected,
                totalModelsDetected,
                totalProjectsAnalyzed : totalProjects,
                averageSecurityScore,
                authenticationType : Object.keys(authenticationTypes)[0] || "Mixed"
            },
            recentReports,
            savedReports,
            chatHistory,
            securityScores,
            techStackStatistics,
            authenticationTypes,
            languageBreakdown,
            securityTrend,
            repositoryStatistics : projects.map(project => ({
                name : project.name,
                apis : project.totalApis,
                models : project.totalModels,
                security : project.securityScore
            }))
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error fetching dashboard"})
    }
}

module.exports = {
    getDashboard
}
