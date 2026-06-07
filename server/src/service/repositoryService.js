const fs = require("fs")
const path = require("path")
const os = require("os")
const AdmZip = require("adm-zip")
const simpleGit = require("simple-git")
const {randomUUID} = require("crypto")

const ignoredFolders = ["node_modules",".git","dist","build",".next","coverage","vendor","target","bin","obj"]
const ignoredExtensions = [".png",".jpg",".jpeg",".gif",".webp",".ico",".pdf",".zip",".exe",".dll",".so",".class",".jar",".lock"]

function createWorkDir() {
    const dir = path.join(os.tmpdir(),`codeatlas-${randomUUID()}`)
    fs.mkdirSync(dir,{recursive : true})
    return dir
}

function shouldIgnore(filePath) {
    const parts = filePath.split(path.sep)
    const ext = path.extname(filePath).toLowerCase()

    return parts.some(part => ignoredFolders.includes(part)) || ignoredExtensions.includes(ext)
}

async function cloneRepository(repositoryUrl) {
    const workDir = createWorkDir()
    await simpleGit().clone(repositoryUrl,workDir,["--depth","1"])
    return workDir
}

async function extractZip(buffer) {
    const workDir = createWorkDir()
    const zip = new AdmZip(buffer)
    zip.extractAllTo(workDir,true)
    return workDir
}

function walkFiles(dir,baseDir = dir,files = []) {
    const entries = fs.readdirSync(dir,{withFileTypes : true})

    entries.forEach(entry => {
        const fullPath = path.join(dir,entry.name)
        const relativePath = path.relative(baseDir,fullPath)

        if(shouldIgnore(fullPath)) {
            return
        }

        if(entry.isDirectory()) {
            walkFiles(fullPath,baseDir,files)
        } else {
            files.push({
                path : relativePath,
                fullPath
            })
        }
    })

    return files
}

function readProjectFiles(workDir) {
    const files = walkFiles(workDir).slice(0,400)

    return files.map(file => {
        let content = ""

        try {
            content = fs.readFileSync(file.fullPath,"utf8")
        } catch (error) {
            content = ""
        }

        return {
            path : file.path,
            content : content.slice(0,12000)
        }
    }).filter(file => file.content.trim())
}

function cleanupWorkDir(workDir) {
    if(workDir && workDir.includes("codeatlas-")) {
        fs.rmSync(workDir,{recursive : true,force : true})
    }
}

module.exports = {
    cloneRepository,
    extractZip,
    readProjectFiles,
    cleanupWorkDir
}

