const reportModel = require("../models/analysisReport")

async function getAllReports(req,res) {
    try {
        const {search,tech,status} = req.query
        const query = {user : req.user.id}

        if(status) {
            query.status = status
        }

        if(tech) {
            query.techStack = tech
        }

        if(search) {
            query.$or = [
                {title : {$regex : search,$options : "i"}},
                {summary : {$regex : search,$options : "i"}},
                {repositoryUrl : {$regex : search,$options : "i"}}
            ]
        }

        const reports = await reportModel.find(query).sort({createdAt : -1})
        res.status(200).json({reports})
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error fetching reports"})
    }
}

async function getReportById(req,res) {
    try {
        const report = await reportModel.findOne({_id : req.params.id,user : req.user.id})

        if(!report) {
            return res.status(404).json({
                message : "Report not found"
            })
        }

        res.status(200).json({report})
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error fetching report"})
    }
}

async function deleteReport(req,res) {
    try {
        const report = await reportModel.findOneAndDelete({_id : req.params.id,user : req.user.id})

        if(!report) {
            return res.status(404).json({
                message : "Report not found"
            })
        }

        res.status(200).json({message : "Report deleted successfully"})
    } catch (error) {
        console.error(error);
        res.status(500).json({message : "Error deleting report"})
    }
}

async function exportMarkdown(req,res) {
    const report = await reportModel.findOne({_id : req.params.id,user : req.user.id})

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    res.setHeader("Content-Type","text/markdown")
    res.setHeader("Content-Disposition",`attachment; filename="${report.title || "codeatlas-report"}.md"`)
    res.send(report.markdown || report.readme || "# CodeAtlas Report")
}

async function exportReadme(req,res) {
    const report = await reportModel.findOne({_id : req.params.id,user : req.user.id})

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    res.setHeader("Content-Type","text/markdown")
    res.setHeader("Content-Disposition",`attachment; filename="README-${report.title || "codeatlas"}.md"`)
    res.send(report.readme || report.markdown || "# README")
}

async function exportDiagram(req,res) {
    const report = await reportModel.findOne({_id : req.params.id,user : req.user.id})

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    const diagram = report.architecture?.systemDiagram || "graph TD\nApp[Application]"
    res.setHeader("Content-Type","text/plain")
    res.setHeader("Content-Disposition",`attachment; filename="${report.title || "architecture"}-diagram.mmd"`)
    res.send(diagram)
}

async function exportPdf(req,res) {
    const report = await reportModel.findOne({_id : req.params.id,user : req.user.id})

    if(!report) {
        return res.status(404).json({
            message : "Report not found"
        })
    }

    res.setHeader("Content-Type","text/plain")
    res.setHeader("Content-Disposition",`attachment; filename="${report.title || "codeatlas-report"}.pdf.txt"`)
    res.send(report.markdown || report.readme || "# CodeAtlas Report")
}

module.exports = {
    getAllReports,
    getReportById,
    deleteReport,
    exportMarkdown,
    exportReadme,
    exportDiagram,
    exportPdf
}
