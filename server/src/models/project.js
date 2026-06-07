const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "User",
        required : true
    },
    name : String,
    sourceType : {
        type : String,
        enum : ["github","zip"],
        required : true
    },
    repositoryUrl : String,
    description : String,
    language : String,
    techStack : [String],
    totalApis : {
        type : Number,
        default : 0
    },
    totalModels : {
        type : Number,
        default : 0
    },
    securityScore : {
        type : Number,
        default : 0
    },
    latestVersion : {
        type : Number,
        default : 1
    }
},{timestamps : true})

module.exports = mongoose.model("Project",projectSchema)

