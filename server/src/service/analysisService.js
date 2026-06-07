const path = require("path")

const languageByExtension = {
    ".js" : "JavaScript",
    ".jsx" : "JavaScript",
    ".ts" : "TypeScript",
    ".tsx" : "TypeScript",
    ".py" : "Python",
    ".java" : "Java",
    ".go" : "Go",
    ".php" : "PHP",
    ".rb" : "Ruby",
    ".cs" : "C#",
    ".css" : "CSS",
    ".scss" : "SCSS",
    ".html" : "HTML"
}

function detectTechStack(files) {
    const stack = new Set()
    const packageFile = files.find(file => file.path.endsWith("package.json"))
    const allText = files.map(file => `${file.path}\n${file.content}`).join("\n")

    stack.add("Node.js")

    if(packageFile) {
        try {
            const pkg = JSON.parse(packageFile.content)
            const deps = {...pkg.dependencies,...pkg.devDependencies}
            Object.keys(deps || {}).forEach(dep => {
                if(dep === "react") stack.add("React")
                if(dep === "next") stack.add("Next.js")
                if(dep === "vite") stack.add("Vite")
                if(dep === "express") stack.add("Express")
                if(dep === "mongoose") stack.add("MongoDB")
                if(dep === "mysql2") stack.add("MySQL")
                if(dep === "pg") stack.add("PostgreSQL")
                if(dep === "typescript") stack.add("TypeScript")
                if(dep === "jsonwebtoken") stack.add("JWT")
                if(dep === "bcrypt" || dep === "bcryptjs") stack.add("bcrypt")
                if(dep === "prisma" || dep === "@prisma/client") stack.add("Prisma")
                if(dep === "tailwindcss") stack.add("Tailwind CSS")
            })
        } catch (error) {}
    }

    if(allText.includes("SpringApplication")) stack.add("Spring Boot")
    if(allText.includes("mongoose.Schema")) stack.add("MongoDB")
    if(files.some(file => file.path.endsWith(".ts") || file.path.endsWith(".tsx"))) stack.add("TypeScript")
    if(allText.includes("app.get(") || allText.includes("router.get(")) stack.add("Express")

    return Array.from(stack)
}

function detectLanguageBreakdown(files) {
    const counts = {}

    files.forEach(file => {
        const ext = path.extname(file.path)
        const language = languageByExtension[ext] || "Other"
        counts[language] = (counts[language] || 0) + 1
    })

    return Object.keys(counts).map(language => ({
        language,
        files : counts[language]
    })).sort((a,b) => b.files - a.files)
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

function detectControllers(files) {
    const controllers = []

    files.forEach(file => {
        if(!file.path.toLowerCase().includes("controller")) return

        const functions = []
        const functionRegex = /(?:async\s+)?function\s+(\w+)\s*\(|(?:const|let)\s+(\w+)\s*=\s*(?:async\s*)?\(/g
        let match;

        while((match = functionRegex.exec(file.content)) !== null) {
            functions.push(match[1] || match[2])
        }

        controllers.push({
            file : file.path,
            functions,
            responsibilities : inferResponsibilities(file.content)
        })
    })

    return controllers
}

function inferResponsibilities(content) {
    const items = []
    if(content.includes("req.body")) items.push("Reads request payloads")
    if(content.includes("find") || content.includes("create") || content.includes("save")) items.push("Uses database models")
    if(content.includes("jwt")) items.push("Handles token logic")
    if(content.includes("res.cookie")) items.push("Sets authentication cookies")
    if(content.includes("await")) items.push("Runs async business logic")
    return items
}

function detectMiddleware(files) {
    return files.filter(file => file.path.toLowerCase().includes("middleware")).map(file => ({
        file : file.path,
        name : path.basename(file.path,path.extname(file.path)),
        checks : [
            file.content.includes("jwt.verify") ? "JWT verification" : "",
            file.content.includes("req.cookies") ? "Cookie token lookup" : "",
            file.content.includes("multer") ? "File upload handling" : "",
            file.content.includes("role") || file.content.includes("roles") ? "Role authorization" : ""
        ].filter(Boolean)
    }))
}

function detectServices(files) {
    return files.filter(file => file.path.toLowerCase().includes("service")).map(file => {
        const calls = []
        if(file.content.includes("GoogleGenAI") || file.content.includes("generateContent")) calls.push("Gemini AI")
        if(file.content.includes("mongoose")) calls.push("Database")
        if(file.content.includes("simpleGit")) calls.push("Git repository clone")
        if(file.content.includes("AdmZip")) calls.push("ZIP extraction")

        return {
            file : file.path,
            name : path.basename(file.path,path.extname(file.path)),
            externalCalls : calls
        }
    })
}

function detectApis(files) {
    const apis = []
    const routeRegex = /(router|app)\.(get|post|put|patch|delete)\(\s*["'`]([^"'`]+)["'`]\s*,\s*([^\n]+)\)/g

    files.forEach(file => {
        let match;

        while((match = routeRegex.exec(file.content)) !== null) {
            const chain = match[4].split(",").map(item => item.trim()).filter(Boolean)
            const handler = chain[chain.length - 1] || "inlineHandler"
            const middleware = chain.slice(0,-1)

            apis.push({
                file : file.path,
                method : match[2].toUpperCase(),
                path : match[3],
                description : createApiDescription(match[2],match[3],handler),
                controller : handler,
                middleware,
                request : inferRequestPayload(files,handler),
                response : inferResponsePayload(files,handler),
                citations : [file.path]
            })
        }
    })

    return apis
}

function createApiDescription(method,route,handler) {
    const cleanHandler = handler.replace(/[{}]/g,"")
    return `${method.toUpperCase()} ${route} is handled by ${cleanHandler}.`
}

function inferRequestPayload(files,handler) {
    const name = handler.split(".").pop().replace(/[^\w]/g,"")
    const file = files.find(item => item.content.includes(`function ${name}`) || item.content.includes(`${name} =`))

    if(!file) return []

    const bodyMatch = file.content.match(/const\s+\{([^}]+)\}\s*=\s*req\.body/)
    if(!bodyMatch) return []

    return bodyMatch[1].split(",").map(item => item.trim()).filter(Boolean)
}

function inferResponsePayload(files,handler) {
    const name = handler.split(".").pop().replace(/[^\w]/g,"")
    const file = files.find(item => item.content.includes(`function ${name}`) || item.content.includes(`${name} =`))

    if(!file) return ["message"]

    const keys = []
    const responseRegex = /json\(\s*\{([^}]+)\}/g
    let match;

    while((match = responseRegex.exec(file.content)) !== null) {
        match[1].split(",").forEach(item => {
            const key = item.split(":")[0].trim()
            if(key && !keys.includes(key)) keys.push(key)
        })
    }

    return keys.length ? keys.slice(0,8) : ["message"]
}

function detectDatabase(files) {
    const models = []
    const prismaModels = []
    const relationships = []

    files.forEach(file => {
        if(file.content.includes("mongoose.Schema")) {
            const nameMatch = file.content.match(/mongoose\.model\(["'`]([^"'`]+)["'`]/)
            const fields = extractSchemaFields(file.content)
            const name = nameMatch ? nameMatch[1] : path.basename(file.path,path.extname(file.path))

            models.push({
                file : file.path,
                type : "Mongoose Model",
                name,
                fields
            })

            extractRelationships(file.content,name,file.path).forEach(item => relationships.push(item))
        }

        const prismaRegex = /model\s+(\w+)\s+\{([\s\S]*?)\}/g
        let match;
        while((match = prismaRegex.exec(file.content)) !== null) {
            prismaModels.push({
                file : file.path,
                type : "Prisma Model",
                name : match[1],
                fields : match[2].split("\n").map(line => line.trim().split(" ")[0]).filter(Boolean)
            })
        }
    })

    return {
        models,
        prismaModels,
        relationships,
        explanation : "Detected database entities from Mongoose schemas, Prisma models, and ObjectId references."
    }
}

function extractSchemaFields(content) {
    const fields = []
    const fieldRegex = /^\s+(\w+)\s*:/gm
    let match;

    while((match = fieldRegex.exec(content)) !== null) {
        fields.push(match[1])
    }

    return [...new Set(fields)].slice(0,40)
}

function extractRelationships(content,modelName,file) {
    const relationships = []
    const relationRegex = /(\w+)\s*:\s*\{[\s\S]*?ref\s*:\s*["'`]([^"'`]+)["'`]/g
    let match;

    while((match = relationRegex.exec(content)) !== null) {
        relationships.push({
            from : modelName,
            to : match[2],
            field : match[1],
            file
        })
    }

    return relationships
}

function analyzeAuthentication(files,apis) {
    const text = files.map(file => file.content).join("\n")
    const usesJwt = text.includes("jsonwebtoken") || text.includes("jwt.sign") || text.includes("jwt.verify")
    const usesCookies = text.includes("cookie") || text.includes("req.cookies") || text.includes("res.cookie")
    const usesOAuth = text.toLowerCase().includes("oauth") || text.toLowerCase().includes("passport")
    const usesSession = text.includes("express-session") || text.includes("req.session")
    const jwtGeneration = findLocations(files,["jwt.sign"])
    const jwtVerification = findLocations(files,["jwt.verify"])
    const cookieSettings = findLocations(files,["res.cookie","sameSite","httpOnly","secure"])
    const protectedRoutes = apis.filter(api => api.middleware.some(item => item.toLowerCase().includes("auth")))

    return {
        type : usesJwt ? "JWT" : usesSession ? "Session" : usesOAuth ? "OAuth" : "Not detected",
        detected : {
            jwt : usesJwt,
            cookies : usesCookies,
            oauth : usesOAuth,
            sessions : usesSession
        },
        jwtGeneration,
        jwtVerification,
        cookieSettings,
        protectedRoutes : protectedRoutes.map(api => ({
            method : api.method,
            path : api.path,
            middleware : api.middleware,
            source : api.file
        })),
        loginFlow : usesJwt ? "Login validates credentials, signs a JWT, stores it in an HTTP-only cookie, and returns user metadata." : "No clear JWT login flow was detected.",
        registrationFlow : "Registration creates a user, hashes the password, and can start a session by issuing a token.",
        authorizationFlow : "Protected routes call middleware before controller execution. Middleware verifies the cookie token and attaches the decoded user to the request.",
        middlewareExplanation : "Authentication middleware is detected from token verification, cookies, blacklist checks, and route middleware chains."
    }
}

function findLocations(files,patterns) {
    const locations = []

    files.forEach(file => {
        const lines = file.content.split("\n")
        lines.forEach((line,index) => {
            if(patterns.some(pattern => line.includes(pattern))) {
                locations.push({
                    file : file.path,
                    line : index + 1,
                    code : line.trim().slice(0,160)
                })
            }
        })
    })

    return locations.slice(0,20)
}

function analyzeSecurity(files,auth) {
    const text = files.map(file => file.content).join("\n")
    const issues = []

    addSecurityIssue(issues,!text.includes("helmet"),"Medium","Helmet middleware is not detected","Add helmet to configure secure HTTP headers.")
    addSecurityIssue(issues,!text.toLowerCase().includes("ratelimit") && !text.includes("express-rate-limit"),"High","Rate limiting is not detected","Add rate limiting to auth, upload, and AI analysis routes.")
    addSecurityIssue(issues,auth.detected.jwt && !text.includes("expiresIn"),"High","JWT expiry is not detected","Sign JWTs with a short expiry and refresh intentionally.")
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("httpOnly"),"Critical","HTTP-only cookie flag is not detected","Set httpOnly on auth cookies to reduce token theft risk.")
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("sameSite"),"Medium","SameSite cookie flag is not detected","Set sameSite to lax or strict for auth cookies.")
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("secure"),"Medium","Secure cookie flag is not detected","Set secure cookies in production.")
    addSecurityIssue(issues,!text.includes("bcrypt"),"Critical","Password hashing is not detected","Hash passwords with bcrypt before saving users.")
    addSecurityIssue(issues,!text.toLowerCase().includes("validate") && !text.includes("zod") && !text.includes("joi"),"Medium","Input validation is limited or missing","Validate request payloads before controller logic.")
    addSecurityIssue(issues,text.includes("multer") && !text.includes("limits"),"High","Upload size limits are not detected","Set strict file size limits for uploads.")
    addSecurityIssue(issues,text.includes("multer") && !text.includes("fileFilter"),"Medium","Upload MIME/type filtering is not detected","Filter uploads so only repository ZIP files are accepted.")
    addSecurityIssue(issues,text.includes("cors(") && text.includes("*"),"High","CORS may allow every origin","Restrict CORS origins to trusted frontend domains.")
    addSecurityIssue(issues,text.includes("eval("),"Critical","Dangerous eval usage detected","Remove eval and use safe parsers or explicit execution boundaries.")

    const penalty = issues.reduce((sum,item) => {
        if(item.severity === "Critical") return sum + 22
        if(item.severity === "High") return sum + 14
        if(item.severity === "Medium") return sum + 8
        return sum + 4
    },0)

    return {
        score : Math.max(100 - penalty,0),
        issues,
        vulnerabilities : issues.map(item => item.title),
        recommendations : issues.map(item => item.recommendation),
        checklist : {
            helmet : text.includes("helmet"),
            rateLimiting : text.toLowerCase().includes("ratelimit") || text.includes("express-rate-limit"),
            jwtExpiry : text.includes("expiresIn"),
            cookieFlags : text.includes("httpOnly") && text.includes("sameSite") && text.includes("secure"),
            passwordHashing : text.includes("bcrypt"),
            inputValidation : text.toLowerCase().includes("validate") || text.includes("zod") || text.includes("joi"),
            uploadSecurity : !text.includes("multer") || (text.includes("limits") && text.includes("fileFilter")),
            corsConfiguration : text.includes("cors(") && !text.includes("*")
        }
    }
}

function addSecurityIssue(issues,condition,severity,title,recommendation) {
    if(condition) {
        issues.push({
            severity,
            title,
            recommendation
        })
    }
}

function createArchitecture(techStack,database,apis) {
    const frontend = techStack.find(item => ["React","Next.js","Vite"].includes(item)) || "Frontend"
    const backend = techStack.find(item => ["Express","Spring Boot"].includes(item)) || "Backend API"
    const db = techStack.find(item => ["MongoDB","MySQL","PostgreSQL","Prisma"].includes(item)) || "Database"

    return {
        summary : "The application is organized around frontend screens, backend routes, controller logic, service modules, persistence, authentication, and AI integrations.",
        systemDiagram : `graph TD\nClient[${frontend}] --> API[${backend}]\nAPI --> Auth[Authentication]\nAPI --> DB[(${db})]\nAPI --> AI[AI Provider]\nAPI --> Files[Repository Files]`,
        authDiagram : "graph TD\nUser[User] --> Login[Login/Register]\nLogin --> Controller[Auth Controller]\nController --> Hash[Password Hashing]\nController --> JWT[JWT Generation]\nJWT --> Cookie[HTTP-only Cookie]\nCookie --> Middleware[Auth Middleware]\nMiddleware --> Protected[Protected Routes]",
        databaseDiagram : buildDatabaseDiagram(database),
        apiDiagram : buildApiDiagram(apis),
        dependencyDiagram : "graph TD\nFrontend --> Route\nRoute --> Middleware\nMiddleware --> Controller\nController --> Service\nService --> Database\nService --> AI",
        layers : {
            frontend : techStack.filter(item => ["React","Next.js","TypeScript","Tailwind CSS","Vite"].includes(item)),
            backend : techStack.filter(item => ["Express","Node.js","Spring Boot"].includes(item)),
            database : techStack.filter(item => ["MongoDB","MySQL","PostgreSQL","Prisma"].includes(item)),
            authentication : techStack.filter(item => ["JWT","bcrypt"].includes(item))
        }
    }
}

function buildDatabaseDiagram(database) {
    const lines = ["erDiagram"]
    database.relationships.forEach(relation => {
        lines.push(`  ${relation.from} ||--o{ ${relation.to} : ${relation.field}`)
    })

    database.models.forEach(model => {
        lines.push(`  ${model.name} {`)
        model.fields.slice(0,10).forEach(field => lines.push(`    string ${field}`))
        lines.push("  }")
    })

    return lines.length > 1 ? lines.join("\n") : "graph TD\nDatabase[(Database)] --> Models[Models not detected]"
}

function buildApiDiagram(apis) {
    const lines = ["graph TD","Client[Client] --> Router[Routes]"]
    apis.slice(0,8).forEach((api,index) => {
        lines.push(`Router --> A${index}[${api.method} ${api.path}]`)
        lines.push(`A${index} --> C${index}[${api.controller.replace(/[^\w.]/g,"") || "Controller"}]`)
    })

    return lines.join("\n")
}

function buildDependencyGraph(apis,services,database) {
    return {
        nodes : [
            {id : "frontend", label : "Frontend", type : "frontend"},
            {id : "routes", label : "Routes", type : "route"},
            {id : "controllers", label : "Controllers", type : "controller"},
            {id : "services", label : "Services", type : "service"},
            {id : "database", label : database.models.length ? "Database Models" : "Database", type : "database"}
        ],
        edges : [
            {from : "frontend", to : "routes"},
            {from : "routes", to : "controllers"},
            {from : "controllers", to : "services"},
            {from : "services", to : "database"}
        ],
        apiChains : apis.map(api => ({
            endpoint : `${api.method} ${api.path}`,
            chain : ["Frontend", api.file, ...api.middleware, api.controller].filter(Boolean)
        })),
        services : services.map(service => ({
            name : service.name,
            file : service.file,
            externalCalls : service.externalCalls
        }))
    }
}

function generateInterviewQuestions(techStack,auth,database,apis) {
    return {
        beginner : [
            "What problem does this project solve?",
            `Which technologies power this project? (${techStack.join(", ") || "review the stack section"})`,
            "How are routes, controllers, services, and models organized?"
        ],
        intermediate : [
            auth.detected.jwt ? "Why does this project use JWT authentication?" : "How would you add JWT authentication to this project?",
            apis.length ? `Explain the flow of ${apis[0].method} ${apis[0].path}.` : "Explain the API route to controller flow.",
            database.models.length ? `Explain the ${database.models[0].name} database model.` : "Where would database models belong in this architecture?"
        ],
        advanced : [
            "How would you scale this architecture for a larger engineering team?",
            "Which security issues would you prioritize before production?",
            "How would you compare two versions of this repository and explain the architectural changes?"
        ],
        mockInterviewPrompts : [
            "Explain this project like you built it.",
            "Walk me through the authentication flow.",
            "Defend the database design choices.",
            "Explain the most important API from request to response."
        ]
    }
}

function createProjectExplanations(data) {
    return {
        fiveMinute : `This project is a ${data.techStack.join(", ")} application. It is organized into recognizable layers: routes receive requests, controllers coordinate business logic, services handle deeper operations, and models store persistent data. The most important APIs are ${data.apis.slice(0,3).map(api => `${api.method} ${api.path}`).join(", ") || "documented in the API section"}. Authentication is ${data.authentication.type}.`,
        tenMinute : `A longer walkthrough should start with the product purpose, then move into architecture, authentication, database design, API flow, security choices, and deployment. The key technical story is how frontend actions become backend routes, then controller/service calls, then database or AI operations.`,
        interview : "I would explain this as a production-style repository with clear separation of concerns. I would highlight the architecture layers, authentication decisions, main data models, core APIs, security improvements, and the tradeoffs I would improve next."
    }
}

function buildReadme(data) {
    return `# ${data.title}

## Overview

${data.overview}

## Features

- Repository analysis
- Authentication and protected routes
- API documentation
- Database schema documentation
- Security recommendations
- Architecture diagrams

## Tech Stack

${data.techStack.map(item => `- ${item}`).join("\n") || "- Review package files"}

## Architecture

\`\`\`mermaid
${data.architecture.systemDiagram}
\`\`\`

## Installation

\`\`\`bash
npm install
npm run dev
\`\`\`

## Environment Variables

\`\`\`txt
MONGO_URI=
JWT_SECRET=
GOOGLE_API_KEY=
FRONTEND_URL=
\`\`\`

## API Documentation

${data.apis.map(api => `### ${api.method} ${api.path}\n\nController: ${api.controller}\n\nMiddleware: ${api.middleware.join(", ") || "none"}\n`).join("\n") || "No API routes detected."}

## Folder Structure

Routes, controllers, services, middleware, models, components, hooks, context, and utilities are documented in the generated report.
`
}

function buildMarkdownReport(data) {
    return `# ${data.title}

## Project Overview

${data.overview}

## Architecture

${data.architecture.summary}

\`\`\`mermaid
${data.architecture.systemDiagram}
\`\`\`

## Authentication

Type: ${data.authentication.type}

${data.authentication.authorizationFlow}

## APIs

${data.apis.map(api => `- ${api.method} ${api.path} -> ${api.controller}`).join("\n") || "- No APIs detected"}

## Database

${data.database.models.map(model => `- ${model.name}: ${model.fields.join(", ")}`).join("\n") || "- No database models detected"}

## Security

Score: ${data.security.score}/100

${data.security.issues.map(item => `- ${item.severity}: ${item.title}`).join("\n") || "- No critical issues detected"}

## Interview Questions

${data.interviewQuestions.intermediate.map(item => `- ${item}`).join("\n")}
`
}

function analyzeRepository(files,name,repositoryUrl) {
    const techStack = detectTechStack(files)
    const languageBreakdown = detectLanguageBreakdown(files)
    const folderStructure = detectFolderStructure(files)
    const controllers = detectControllers(files)
    const middleware = detectMiddleware(files)
    const services = detectServices(files)
    const apis = detectApis(files)
    const database = detectDatabase(files)
    const authentication = analyzeAuthentication(files,apis)
    const security = analyzeSecurity(files,authentication)
    const architecture = createArchitecture(techStack,database,apis)
    const dependencyGraph = buildDependencyGraph(apis,services,database)
    const interviewQuestions = generateInterviewQuestions(techStack,authentication,database,apis)
    const title = name || repositoryUrl || "Uploaded Repository"
    const overview = `${title} contains ${files.length} analyzed source files. CodeAtlas detected ${techStack.length} stack items, ${apis.length} API endpoints, ${controllers.length} controller files, ${services.length} service files, and ${database.models.length + database.prismaModels.length} data models.`

    const report = {
        title,
        repositoryUrl,
        summary : overview,
        overview,
        languageBreakdown,
        folderStructure,
        controllers,
        middleware,
        services,
        dependencyGraph,
        techStack,
        authentication,
        database,
        apis,
        security,
        architecture,
        readme : "",
        interviewQuestions,
        projectExplanations : {},
        qualitySignals : {
            hasTests : files.some(file => file.path.includes("test") || file.path.includes("spec")),
            hasDocker : files.some(file => file.path.toLowerCase().includes("dockerfile") || file.path.includes("docker-compose")),
            hasReadme : files.some(file => file.path.toLowerCase().includes("readme")),
            hasEnvExample : files.some(file => file.path.includes(".env.example"))
        }
    }

    report.projectExplanations = createProjectExplanations(report)
    report.readme = buildReadme(report)
    report.markdown = buildMarkdownReport(report)

    return report
}

module.exports = {
    analyzeRepository
}

