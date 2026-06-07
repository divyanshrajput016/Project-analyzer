const projectModel = require("../models/project")
const reportModel = require("../models/analysisReport")
const repositoryService = require("../service/repositoryService")
const {analyzeRepository} = require("../service/analysisService")
const {generateAIReport} = require("../service/aiService")

function getRepoName(repositoryUrl) {
    if(!repositoryUrl) return "Uploaded Repository"
    return repositoryUrl.split("/").filter(Boolean).pop()?.replace(".git","") || repositoryUrl
}

async function saveAnalysis(req,res,sourceType,repositoryUrl,workDir,name) {
    try {
        const files = repositoryService.readProjectFiles(workDir)

        if(!files.length) {
            return res.status(400).json({
                message : "No readable source files found"
            })
        }

        const staticReport = analyzeRepository(files,name || getRepoName(repositoryUrl),repositoryUrl)
        const finalReport = await generateAIReport(staticReport,files)

        let project = null

        if(repositoryUrl) {
            project = await projectModel.findOne({user : req.user.id,repositoryUrl})
        }

        if(!project) {
            project = await projectModel.create({
                user : req.user.id,
                name : finalReport.title,
                sourceType,
                repositoryUrl,
                description : finalReport.summary,
                language : finalReport.languageBreakdown?.[0]?.language || "",
                techStack : finalReport.techStack,
                totalApis : finalReport.apis.length,
                totalModels : finalReport.database.models.length + finalReport.database.prismaModels.length,
                securityScore : finalReport.security.score,
                latestVersion : 1
            })
        } else {
            project.latestVersion += 1
            project.language = finalReport.languageBreakdown?.[0]?.language || project.language
            project.techStack = finalReport.techStack
            project.totalApis = finalReport.apis.length
            project.totalModels = finalReport.database.models.length + finalReport.database.prismaModels.length
            project.securityScore = finalReport.security.score
            await project.save()
        }

        const report = await reportModel.create({
            user : req.user.id,
            project : project._id,
            version : project.latestVersion,
            ...finalReport
        })

        res.status(201).json({
            message : "Repository analyzed successfully",
            project,
            report
        })
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error analyzing repository"})
    } finally {
        repositoryService.cleanupWorkDir(workDir)
    }
}

async function analyzeGithubUrl(req,res) {
    const {repositoryUrl} = req.body

    if(!repositoryUrl) {
        return res.status(400).json({
            message : "Repository URL is required"
        })
    }

    let workDir = null

    try {
        workDir = await repositoryService.cloneRepository(repositoryUrl)
        await saveAnalysis(req,res,"github",repositoryUrl,workDir,getRepoName(repositoryUrl))
    } catch (error) {
        console.error(error);
        if(workDir) repositoryService.cleanupWorkDir(workDir)
        res.status(500).json({message : "Error cloning repository"})
    }
}

async function analyzeZip(req,res) {
    if(!req.file) {
        return res.status(400).json({
            message : "ZIP file is required"
        })
    }

    let workDir = null

    try {
        workDir = await repositoryService.extractZip(req.file.buffer)
        await saveAnalysis(req,res,"zip","",workDir,req.file.originalname.replace(".zip",""))
    } catch (error) {
        console.error(error);
        if(workDir) repositoryService.cleanupWorkDir(workDir)
        res.status(500).json({message : "Error extracting ZIP"})
    }
}

async function getProjects(req,res) {
    const projects = await projectModel.find({user : req.user.id}).sort({createdAt : -1})
    res.status(200).json({projects})
}

async function compareVersions(req,res) {
    const reports = await reportModel.find({project : req.params.projectId,user : req.user.id}).sort({version : 1})

    if(reports.length < 2) {
        return res.status(400).json({
            message : "At least two versions are required for comparison"
        })
    }

    const previous = reports[reports.length - 2]
    const current = reports[reports.length - 1]
    const oldApis = new Set(previous.apis.map(api => `${api.method} ${api.path}`))
    const newApis = new Set(current.apis.map(api => `${api.method} ${api.path}`))
    const oldModels = new Set(previous.database.models.map(model => model.name))
    const newModels = new Set(current.database.models.map(model => model.name))
    const oldDeps = new Set(previous.techStack || [])
    const newDeps = new Set(current.techStack || [])
    const oldModelFields = {}
    const newModelFields = {}

    previous.database.models.forEach(model => {
        oldModelFields[model.name] = (model.fields || []).join("|")
    })

    current.database.models.forEach(model => {
        newModelFields[model.name] = (model.fields || []).join("|")
    })

    res.status(200).json({
        comparison : {
            fromVersion : previous.version,
            toVersion : current.version,
            addedApis : [...newApis].filter(api => !oldApis.has(api)),
            removedApis : [...oldApis].filter(api => !newApis.has(api)),
            changedModels : [...newModels].filter(model => !oldModels.has(model) || oldModelFields[model] !== newModelFields[model]),
            removedModels : [...oldModels].filter(model => !newModels.has(model)),
            changedDependencies : {
                added : [...newDeps].filter(dep => !oldDeps.has(dep)),
                removed : [...oldDeps].filter(dep => !newDeps.has(dep))
            },
            changedSecurityScore : {
                previous : previous.security?.score || 0,
                current : current.security?.score || 0,
                delta : (current.security?.score || 0) - (previous.security?.score || 0)
            },
            changedArchitecture : previous.architecture.summary !== current.architecture.summary || previous.architecture.systemDiagram !== current.architecture.systemDiagram
        }
    })
}

module.exports = {
    analyzeGithubUrl,
    analyzeZip,
    getProjects,
    compareVersions
}
