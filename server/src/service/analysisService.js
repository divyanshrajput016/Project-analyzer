function detectTechStack(files) {
    const stack = new Set()
    const packageFile = files.find(file => file.path.endsWith("package.json"))
    const allText = files.map(file => `${file.path}\n${file.content}`).join("\n")

    if(packageFile) {
        try {
            const pkg = JSON.parse(packageFile.content)
            const deps = {...pkg.dependencies,...pkg.devDependencies}
            Object.keys(deps || {}).forEach(dep => {
                if(dep === "react") stack.add("React")
                if(dep === "next") stack.add("Next.js")
                if(dep === "express") stack.add("Express")
                if(dep === "mongoose") stack.add("MongoDB")
                if(dep === "mysql2") stack.add("MySQL")
                if(dep === "pg") stack.add("PostgreSQL")
                if(dep === "typescript") stack.add("TypeScript")
                if(dep === "jsonwebtoken") stack.add("JWT")
                if(dep === "bcrypt" || dep === "bcryptjs") stack.add("bcrypt")
                if(dep === "prisma" || dep === "@prisma/client") stack.add("Prisma")
            })
        } catch (error) {}
    }

    if(allText.includes("SpringApplication")) stack.add("Spring Boot")
    if(allText.includes("mongoose.Schema")) stack.add("MongoDB")
    if(allText.includes("tsx") || allText.includes(".ts")) stack.add("TypeScript")
    if(allText.includes("app.get(") || allText.includes("router.get(")) stack.add("Express")

    return Array.from(stack)
}

function detectFolderStructure(files) {
    const folders = {
        routes : [],
        controllers : [],
        services : [],
        middleware : [],
        models : [],
        components : [],
        hooks : [],
        context : [],
        utilities : []
    }

    files.forEach(file => {
        const lower = file.path.toLowerCase()
        if(lower.includes("route")) folders.routes.push(file.path)
        if(lower.includes("controller")) folders.controllers.push(file.path)
        if(lower.includes("service")) folders.services.push(file.path)
        if(lower.includes("middleware")) folders.middleware.push(file.path)
        if(lower.includes("model") || lower.includes("schema")) folders.models.push(file.path)
        if(lower.includes("component")) folders.components.push(file.path)
        if(lower.includes("hook")) folders.hooks.push(file.path)
        if(lower.includes("context")) folders.context.push(file.path)
        if(lower.includes("util") || lower.includes("helper")) folders.utilities.push(file.path)
    })

    return folders
}

function detectApis(files) {
    const apis = []
    const routeRegex = /(router|app)\.(get|post|put|patch|delete)\(["'`]([^"'`]+)["'`]/g

    files.forEach(file => {
        let match;

        while((match = routeRegex.exec(file.content)) !== null) {
            apis.push({
                file : file.path,
                method : match[2].toUpperCase(),
                path : match[3],
                description : `${match[2].toUpperCase()} endpoint declared in ${file.path}`,
                request : "Review controller for exact payload",
                response : "JSON response"
            })
        }
    })

    return apis
}

function detectDatabase(files) {
    const models = []
    const prismaModels = []

    files.forEach(file => {
        if(file.content.includes("mongoose.Schema")) {
            const nameMatch = file.content.match(/mongoose\.model\(["'`]([^"'`]+)["'`]/)
            models.push({
                file : file.path,
                type : "Mongoose Model",
                name : nameMatch ? nameMatch[1] : file.path.split("/").pop(),
                fields : extractSchemaFields(file.content)
            })
        }

        const prismaRegex = /model\s+(\w+)\s+\{/g
        let match;
        while((match = prismaRegex.exec(file.content)) !== null) {
            prismaModels.push({
                file : file.path,
                type : "Prisma Model",
                name : match[1]
            })
        }
    })

    return {
        models,
        prismaModels,
        explanation : "Detected database entities from Mongoose schemas and Prisma model declarations."
    }
}

function extractSchemaFields(content) {
    const fields = []
    const fieldRegex = /^\s+(\w+)\s*:/gm
    let match;

    while((match = fieldRegex.exec(content)) !== null) {
        fields.push(match[1])
    }

    return fields.slice(0,30)
}

function analyzeAuthentication(files) {
    const text = files.map(file => file.content).join("\n")
    const usesJwt = text.includes("jsonwebtoken") || text.includes("jwt.sign") || text.includes("jwt.verify")
    const usesCookies = text.includes("cookie") || text.includes("req.cookies") || text.includes("res.cookie")
    const usesOAuth = text.toLowerCase().includes("oauth") || text.toLowerCase().includes("passport")
    const usesSession = text.includes("express-session") || text.includes("req.session")

    return {
        detected : {
            jwt : usesJwt,
            cookies : usesCookies,
            oauth : usesOAuth,
            sessions : usesSession
        },
        loginFlow : usesJwt ? "Login validates credentials, signs a JWT, and returns or stores it for future protected requests." : "No clear JWT login flow was detected.",
        registrationFlow : "Registration flow is inferred from auth routes and user model files when present.",
        authorizationFlow : "Protected middleware checks request identity before controller logic.",
        middlewareExplanation : "Authentication middleware is detected from files containing token verification, cookies, sessions, or authorization checks."
    }
}

function analyzeSecurity(files,auth) {
    const text = files.map(file => file.content).join("\n")
    const vulnerabilities = []
    const recommendations = []
    let score = 100

    if(!auth.detected.jwt && !auth.detected.sessions) {
        score -= 20
        vulnerabilities.push("No clear authentication strategy detected")
    }

    if(!text.includes("bcrypt")) {
        score -= 20
        vulnerabilities.push("Password hashing library not detected")
        recommendations.push("Hash passwords with bcrypt before saving users")
    }

    if(!text.includes("helmet")) {
        score -= 10
        recommendations.push("Add helmet middleware for secure HTTP headers")
    }

    if(text.includes("eval(")) {
        score -= 25
        vulnerabilities.push("Dangerous eval usage detected")
    }

    if(!text.toLowerCase().includes("validate") && !text.includes("zod") && !text.includes("joi")) {
        score -= 10
        recommendations.push("Add request validation for API payloads")
    }

    return {
        score : Math.max(score,0),
        vulnerabilities,
        recommendations
    }
}

function createArchitecture(techStack) {
    return {
        summary : "The application is organized around frontend, backend, database, authentication, and deployment layers.",
        systemDiagram : "graph TD\nClient[Frontend] --> API[Backend API]\nAPI --> Auth[Authentication]\nAPI --> DB[(Database)]\nAPI --> AI[AI Provider]",
        authDiagram : "graph TD\nUser --> Login\nLogin --> JWT\nJWT --> Cookie\nCookie --> ProtectedRoute",
        apiDiagram : "graph TD\nClient --> Route\nRoute --> Controller\nController --> Service\nService --> Database",
        layers : {
            frontend : techStack.filter(item => ["React","Next.js","TypeScript"].includes(item)),
            backend : techStack.filter(item => ["Express","Node.js","Spring Boot"].includes(item)),
            database : techStack.filter(item => ["MongoDB","MySQL","PostgreSQL","Prisma"].includes(item))
        }
    }
}

function generateInterviewQuestions(techStack,auth,database) {
    return {
        beginner : [
            "What is the main purpose of this project?",
            "Which tech stack is used in this repository?",
            "How are the main folders organized?"
        ],
        intermediate : [
            auth.detected.jwt ? "Why is JWT used in this project?" : "How would you add authentication to this project?",
            "Explain the API route to controller flow.",
            database.models.length ? "Explain the main database models." : "Where would database models belong in this architecture?"
        ],
        advanced : [
            "How would you scale this architecture for more users?",
            "What security improvements would you prioritize?",
            "How would you compare two analyzed versions of this repository?"
        ]
    }
}

function buildMarkdownReport(data) {
    return `# ${data.title}

## Project Overview

${data.overview}

## Tech Stack

${data.techStack.map(item => `- ${item}`).join("\n") || "- No stack detected"}

## APIs

${data.apis.map(api => `- ${api.method} ${api.path} (${api.file})`).join("\n") || "- No APIs detected"}

## Security

Score: ${data.security.score}/100

${data.security.vulnerabilities.map(item => `- ${item}`).join("\n") || "- No critical vulnerabilities detected"}

## Architecture

\`\`\`mermaid
${data.architecture.systemDiagram}
\`\`\`
`
}

function analyzeRepository(files,name,repositoryUrl) {
    const techStack = detectTechStack(files)
    const folderStructure = detectFolderStructure(files)
    const apis = detectApis(files)
    const database = detectDatabase(files)
    const authentication = analyzeAuthentication(files)
    const security = analyzeSecurity(files,authentication)
    const architecture = createArchitecture(techStack)
    const interviewQuestions = generateInterviewQuestions(techStack,authentication,database)
    const title = name || repositoryUrl || "Uploaded Repository"
    const overview = `${title} contains ${files.length} analyzed source files. CodeAtlas detected ${techStack.length} stack items, ${apis.length} API endpoints, and ${database.models.length + database.prismaModels.length} data models.`

    const report = {
        title,
        repositoryUrl,
        summary : overview,
        overview,
        folderStructure,
        techStack,
        authentication,
        database,
        apis,
        security,
        architecture,
        readme : "",
        interviewQuestions
    }

    report.markdown = buildMarkdownReport(report)

    return report
}

module.exports = {
    analyzeRepository
}

