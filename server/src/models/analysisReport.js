const mongoose = require("mongoose")

const analysisReportSchema = new mongoose.Schema({
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
    version : {
        type : Number,
        default : 1
    },
    title : String,
    repositoryUrl : String,
    summary : String,
    overview : String,
    languageBreakdown : [mongoose.Schema.Types.Mixed],
    folderStructure : mongoose.Schema.Types.Mixed,
    controllers : [mongoose.Schema.Types.Mixed],
    middleware : [mongoose.Schema.Types.Mixed],
    services : [mongoose.Schema.Types.Mixed],
    dependencyGraph : mongoose.Schema.Types.Mixed,
    techStack : [String],
    authentication : mongoose.Schema.Types.Mixed,
    database : mongoose.Schema.Types.Mixed,
    apis : [mongoose.Schema.Types.Mixed],
    security : mongoose.Schema.Types.Mixed,
    architecture : mongoose.Schema.Types.Mixed,
    readme : String,
    interviewQuestions : mongoose.Schema.Types.Mixed,
    projectExplanations : mongoose.Schema.Types.Mixed,
    qualitySignals : mongoose.Schema.Types.Mixed,
    markdown : String,
    status : {
        type : String,
        enum : ["completed","failed"],
        default : "completed"
    }
},{timestamps : true})

module.exports = mongoose.model("AnalysisReport",analysisReportSchema)
