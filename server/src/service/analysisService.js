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

function createSourceRef(file,line,code) {
    return {
        file : file.path || file,
        line : line || 1,
        code : (code || "").trim().slice(0,180)
    }
}

function findLine(file,pattern) {
    const lines = file.content.split("\n")
    const index = lines.findIndex(line => {
        if(pattern instanceof RegExp) return pattern.test(line)
        return line.includes(pattern)
    })

    return {
        line : index >= 0 ? index + 1 : 1,
        code : index >= 0 ? lines[index] : ""
    }
}

function getFunctionName(handler) {
    return (handler || "").split(".").pop().replace(/[^\w]/g,"")
}

function findFunctionFile(files,name) {
    if(!name) return null
    return files.find(file => file.content.includes(`function ${name}`) || file.content.includes(`${name} =`) || file.content.includes(`${name}:`))
}

function getPackageData(files) {
    const packageFile = files.find(file => file.path.endsWith("package.json"))

    if(!packageFile) {
        return {
            dependencies : {},
            devDependencies : {},
            source : null
        }
    }

    try {
        const pkg = JSON.parse(packageFile.content)
        return {
            dependencies : pkg.dependencies || {},
            devDependencies : pkg.devDependencies || {},
            source : createSourceRef(packageFile,1,"package.json")
        }
    } catch (error) {
        return {
            dependencies : {},
            devDependencies : {},
            source : createSourceRef(packageFile,1,"Invalid package.json")
        }
    }
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
            source : createSourceRef(file,1,path.basename(file.path)),
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
        source : createSourceRef(file,1,path.basename(file.path)),
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
            source : createSourceRef(file,1,path.basename(file.path)),
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
            const routeLocation = findLine(file,match[3])
            const functionName = getFunctionName(handler)
            const controllerFile = findFunctionFile(files,functionName)
            const controllerLocation = controllerFile ? findLine(controllerFile,functionName) : null

            apis.push({
                file : file.path,
                method : match[2].toUpperCase(),
                path : match[3],
                description : createApiDescription(match[2],match[3],handler),
                controller : handler,
                middleware,
                request : inferRequestPayload(files,handler),
                response : inferResponsePayload(files,handler),
                source : createSourceRef(file,routeLocation.line,routeLocation.code),
                citations : [
                    createSourceRef(file,routeLocation.line,routeLocation.code)
                ].concat(controllerFile ? [createSourceRef(controllerFile,controllerLocation.line,controllerLocation.code)] : []),
                flowTrace : traceRouteFlow(files,file,handler,middleware,match[2].toUpperCase(),match[3])
            })
        }
    })

    return apis
}

function traceRouteFlow(files,routeFile,handler,middleware,method,routePath) {
    const functionName = getFunctionName(handler)
    const routeLocation = findLine(routeFile,routePath)
    const controllerFile = findFunctionFile(files,functionName)
    const controllerLocation = controllerFile ? findLine(controllerFile,functionName) : null
    const services = controllerFile ? findServiceCalls(files,controllerFile) : []
    const models = controllerFile ? findModelCalls(files,controllerFile) : []
    const externalApis = controllerFile ? findExternalCalls(files,controllerFile,services) : []

    return {
        label : `${method} ${routePath}`,
        route : createSourceRef(routeFile,routeLocation.line,routeLocation.code),
        middleware : middleware.map(item => ({
            name : item,
            source : findNamedSource(files,item)
        })),
        controller : {
            name : handler,
            source : controllerFile ? createSourceRef(controllerFile,controllerLocation.line,controllerLocation.code) : null
        },
        services,
        models,
        externalApis,
        steps : [
            `Route ${method} ${routePath}`,
            ...middleware.map(item => `Middleware ${item}`),
            `Controller ${handler}`,
            ...services.map(item => `Service/helper ${item.name}`),
            ...models.map(item => `Database/model ${item.name}`),
            ...externalApis.map(item => `External API ${item.name}`)
        ]
    }
}

function findNamedSource(files,name) {
    const clean = getFunctionName(name) || name
    const file = files.find(item => item.content.includes(clean) || item.path.toLowerCase().includes(clean.toLowerCase()))
    if(!file) return null
    const location = findLine(file,clean)
    return createSourceRef(file,location.line,location.code)
}

function findServiceCalls(files,controllerFile) {
    const services = files.filter(file => file.path.toLowerCase().includes("service") || file.path.toLowerCase().includes("helper"))

    return services.filter(service => {
        const name = path.basename(service.path,path.extname(service.path))
        return controllerFile.content.includes(name) || controllerFile.content.includes(`../service`) || controllerFile.content.includes(`../helper`)
    }).map(service => ({
        name : path.basename(service.path,path.extname(service.path)),
        source : createSourceRef(service,1,path.basename(service.path))
    }))
}

function findModelCalls(files,controllerFile) {
    const models = files.filter(file => file.path.toLowerCase().includes("model") || file.content.includes("mongoose.model"))

    return models.filter(model => {
        const name = path.basename(model.path,path.extname(model.path))
        return controllerFile.content.includes(name) || controllerFile.content.includes("Model") || controllerFile.content.includes("../models")
    }).map(model => ({
        name : path.basename(model.path,path.extname(model.path)),
        source : createSourceRef(model,1,path.basename(model.path))
    }))
}

function findExternalCalls(files,controllerFile,services) {
    const sourceFiles = [controllerFile].concat(services.map(service => files.find(file => file.path === service.source.file)).filter(Boolean))
    const calls = []

    sourceFiles.forEach(file => {
        if(file.content.includes("generateContent") || file.content.includes("GoogleGenAI")) {
            const location = findLine(file,/generateContent|GoogleGenAI/)
            calls.push({name : "Gemini API", source : createSourceRef(file,location.line,location.code)})
        }
        if(file.content.includes("axios.") || file.content.includes("fetch(")) {
            const location = findLine(file,/axios\.|fetch\(/)
            calls.push({name : "HTTP API", source : createSourceRef(file,location.line,location.code)})
        }
        if(file.content.includes("simpleGit")) {
            const location = findLine(file,"simpleGit")
            calls.push({name : "Git provider", source : createSourceRef(file,location.line,location.code)})
        }
    })

    return calls
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
                fields,
                keyFields : fields.filter(field => ["email","password","role","user","project","token","repositoryUrl","securityScore","createdAt"].includes(field)),
                purpose : inferModelPurpose(name,fields),
                source : createSourceRef(file,1,path.basename(file.path))
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
                fields : match[2].split("\n").map(line => line.trim().split(" ")[0]).filter(Boolean),
                keyFields : match[2].split("\n").map(line => line.trim().split(" ")[0]).filter(Boolean).slice(0,6),
                purpose : inferModelPurpose(match[1],match[2].split("\n").map(line => line.trim().split(" ")[0]).filter(Boolean)),
                source : createSourceRef(file,findLine(file,`model ${match[1]}`).line,`model ${match[1]}`)
            })
        }
    })

    return {
        models,
        prismaModels,
        relationships,
        relationshipSummary : relationships.map(item => `${item.from} has many ${item.to} records through ${item.field}`),
        explanation : "Detected database entities from Mongoose schemas, Prisma models, and ObjectId references."
    }
}

function inferModelPurpose(name,fields) {
    const lower = name.toLowerCase()
    if(lower.includes("user")) return "Stores account identity, credentials, role, and ownership metadata."
    if(lower.includes("report")) return "Stores generated repository intelligence reports and versioned analysis output."
    if(lower.includes("project")) return "Stores repository metadata, stack summary, and latest analysis metrics."
    if(lower.includes("chat")) return "Stores repository chat questions and grounded answers."
    if(lower.includes("blacklist")) return "Stores invalidated tokens for logout/session revocation."
    return `Stores ${fields.slice(0,4).join(", ") || "domain"} data for this repository.`
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
            from : match[2],
            to : modelName,
            field : match[1],
            type : "one-to-many reference",
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
    const publicRoutes = apis.filter(api => !api.middleware.some(item => item.toLowerCase().includes("auth")))
    const logoutLocations = findLocations(files,["logout","blacklist","clearCookie"])

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
            source : api.source
        })),
        publicRoutes : publicRoutes.map(api => ({
            method : api.method,
            path : api.path,
            source : api.source
        })),
        logoutFlow : {
            explanation : logoutLocations.length ? "Logout/token invalidation is implemented by clearing the cookie and/or storing the token in a blacklist." : "No explicit logout/token invalidation flow was detected.",
            locations : logoutLocations
        },
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

    addSecurityIssue(issues,!text.includes("helmet"),"Medium","Helmet middleware is not detected","Add helmet to configure secure HTTP headers.",[])
    addSecurityIssue(issues,!text.toLowerCase().includes("ratelimit") && !text.includes("express-rate-limit"),"High","Rate limiting is not detected","Add rate limiting to auth, upload, and AI analysis routes.",[])
    addSecurityIssue(issues,auth.detected.jwt && !text.includes("expiresIn"),"High","JWT expiry is not detected","Sign JWTs with a short expiry and refresh intentionally.",auth.jwtGeneration)
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("httpOnly"),"Critical","HTTP-only cookie flag is not detected","Set httpOnly on auth cookies to reduce token theft risk.",auth.cookieSettings)
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("sameSite"),"Medium","SameSite cookie flag is not detected","Set sameSite to lax or strict for auth cookies.",auth.cookieSettings)
    addSecurityIssue(issues,auth.detected.cookies && !text.includes("secure"),"Medium","Secure cookie flag is not detected","Set secure cookies in production.",auth.cookieSettings)
    addSecurityIssue(issues,!text.includes("bcrypt"),"Critical","Password hashing is not detected","Hash passwords with bcrypt before saving users.",[])
    addSecurityIssue(issues,!text.toLowerCase().includes("validate") && !text.includes("zod") && !text.includes("joi"),"Medium","Input validation is limited or missing","Validate request payloads before controller logic.",findLocations(files,["req.body","req.query","req.params"]))
    addSecurityIssue(issues,text.includes("multer") && !text.includes("limits"),"High","Upload size limits are not detected","Set strict file size limits for uploads.",findLocations(files,["multer"]))
    addSecurityIssue(issues,text.includes("multer") && !text.includes("fileFilter"),"Medium","Upload MIME/type filtering is not detected","Filter uploads so only repository ZIP files are accepted.",findLocations(files,["multer"]))
    addSecurityIssue(issues,text.includes("cors(") && text.includes("*"),"High","CORS may allow every origin","Restrict CORS origins to trusted frontend domains.",findLocations(files,["cors("]))
    addSecurityIssue(issues,text.includes("eval("),"Critical","Dangerous eval usage detected","Remove eval and use safe parsers or explicit execution boundaries.",findLocations(files,["eval("]))
    addSecurityIssue(issues,detectExposedSecrets(files).length > 0,"Critical","Possible exposed secrets detected","Move secrets to environment variables and rotate exposed credentials.",detectExposedSecrets(files))

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
            corsConfiguration : text.includes("cors(") && !text.includes("*"),
            exposedSecrets : detectExposedSecrets(files).length === 0
        }
    }
}

function addSecurityIssue(issues,condition,severity,title,recommendation,evidence) {
    if(condition) {
        issues.push({
            severity,
            title,
            recommendation,
            evidence : evidence || []
        })
    }
}

function detectExposedSecrets(files) {
    const secretRegex = /(api[_-]?key|jwt_secret|mongo_uri|password|secret)\s*[:=]\s*["'`][^"'`]{12,}/i
    const matches = []

    files.forEach(file => {
        file.content.split("\n").forEach((line,index) => {
            if(secretRegex.test(line) && !file.path.endsWith(".env.example")) {
                matches.push(createSourceRef(file,index + 1,line.replace(/(["'`]).{8,}\1/,"$1***$1")))
            }
        })
    })

    return matches.slice(0,20)
}

function analyzeCodeQuality(files,apis,services) {
    const issues = []
    const packageData = getPackageData(files)
    const sourceText = files.map(file => file.content).join("\n")

    files.forEach(file => {
        const lineCount = file.content.split("\n").length
        if(lineCount > 350) {
            issues.push({
                severity : "Medium",
                title : "Large file detected",
                recommendation : "Split this file into smaller modules with clearer ownership.",
                evidence : [createSourceRef(file,1,`${lineCount} lines`)]
            })
        }
    })

    if(apis.length > 5 && !services.length) {
        issues.push({
            severity : "Medium",
            title : "Missing service layer",
            recommendation : "Move reusable business logic from controllers into services/helpers.",
            evidence : apis.slice(0,5).map(api => api.source)
        })
    }

    detectDuplicatePatterns(files).forEach(item => issues.push(item))

    Object.keys({...packageData.dependencies,...packageData.devDependencies}).forEach(dep => {
        if(!sourceText.includes(dep) && !["typescript","tailwindcss","vite"].includes(dep)) {
            issues.push({
                severity : "Low",
                title : `Possibly unused dependency: ${dep}`,
                recommendation : "Confirm whether this package is still needed and remove it if unused.",
                evidence : packageData.source ? [packageData.source] : []
            })
        }
    })

    if(sourceText.includes("catch") && !sourceText.includes("next(") && !sourceText.includes("throw")) {
        issues.push({
            severity : "Low",
            title : "Weak error handling pattern",
            recommendation : "Standardize error handling and preserve useful error context.",
            evidence : findLocations(files,["catch"])
        })
    }

    detectExposedSecrets(files).forEach(secret => {
        issues.push({
            severity : "Critical",
            title : "Hardcoded secret pattern",
            recommendation : "Move this value to environment configuration and rotate it.",
            evidence : [secret]
        })
    })

    if(!sourceText.toLowerCase().includes("validate") && !sourceText.includes("zod") && !sourceText.includes("joi")) {
        issues.push({
            severity : "Medium",
            title : "Missing validation layer",
            recommendation : "Add schema validation for request payloads and uploaded files.",
            evidence : findLocations(files,["req.body"])
        })
    }

    return {
        score : Math.max(100 - issues.reduce((sum,item) => sum + (item.severity === "Critical" ? 18 : item.severity === "High" ? 12 : item.severity === "Medium" ? 7 : 3),0),0),
        issues,
        summary : `${issues.length} code quality findings detected across maintainability, validation, dependency hygiene, error handling, and secret safety.`
    }
}

function detectDuplicatePatterns(files) {
    const seen = {}
    const issues = []

    files.forEach(file => {
        file.content.split("\n").map(line => line.trim()).filter(line => line.length > 45).forEach((line,index) => {
            seen[line] = seen[line] || []
            seen[line].push(createSourceRef(file,index + 1,line))
        })
    })

    Object.keys(seen).filter(line => seen[line].length >= 3).slice(0,5).forEach(line => {
        issues.push({
            severity : "Low",
            title : "Duplicate code pattern detected",
            recommendation : "Extract the repeated pattern into a helper or shared module if the duplication is intentional.",
            evidence : seen[line].slice(0,3)
        })
    })

    return issues
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

function createRepositoryWalkthrough(data) {
    return {
        title : "Explain Entire Project",
        explanation : `Project purpose: ${data.title} is best understood as a ${data.techStack.join(", ")} repository with ${data.apis.length} detected APIs and ${data.database.models.length + data.database.prismaModels.length} database models.

Architecture: The application is split into frontend, backend, authentication, database, services/helpers, and deployment concerns. The main system flow is Client -> Routes -> Middleware -> Controllers -> Services -> Database or external APIs.

Frontend flow: Frontend screens or components call backend APIs and display the resulting application state. Relevant frontend folders include ${(data.folderStructure.components || []).slice(0,4).join(", ") || "components not clearly detected"}.

Backend flow: Routes receive requests, middleware protects or transforms them, controllers coordinate validation/business logic, services handle deeper operations, and models persist data.

Authentication: Authentication is ${data.authentication.type}. JWT generation, verification, cookies, protected routes, and logout/token invalidation are documented with source references in the Authentication tab.

Database: The database layer includes ${data.database.models.map(model => model.name).join(", ") || "no detected models"}. Relationships are based on ObjectId/Prisma references.

Key APIs: ${data.apis.slice(0,5).map(api => `${api.method} ${api.path}`).join(", ") || "No API routes were detected"}.

AI integration: ${data.services.some(service => service.externalCalls.includes("Gemini AI")) ? "Gemini AI integration is detected in the service layer." : "No Gemini service integration was detected in source files."}

Deployment: ${data.qualitySignals.hasDocker ? "Docker/deployment files were detected." : "Docker/deployment files were not clearly detected."}

Security choices: Security score is ${data.security.score}/100. Main improvements are ${data.security.issues.slice(0,3).map(issue => issue.title).join(", ") || "not currently flagged"}.

Improvements: Prioritize stronger validation, clearer service boundaries, rate limiting, secure upload filters, and test coverage where missing.`,
        evidence : [
            ...(data.apis[0]?.citations || []),
            ...(data.authentication.jwtGeneration || []).slice(0,2),
            ...(data.database.models || []).slice(0,2).map(model => model.source)
        ].filter(Boolean)
    }
}

function createResumeKit(data) {
    const stack = data.techStack.slice(0,5).join(", ") || "modern web technologies"

    return {
        resumeBullets : [
            `Built and documented a repository intelligence platform using ${stack}, generating architecture, API, database, authentication, and security reports from source code.`,
            `Implemented source-grounded analysis with route flow tracing across routes, middleware, controllers, services, models, and external APIs.`,
            `Created developer-facing report exports including README, markdown, architecture diagrams, PDF summaries, and interview preparation content.`
        ],
        linkedInDescription : `${data.title} is a repository intelligence project that turns source code into architecture documentation, API references, security findings, database maps, README content, and interview-ready explanations.`,
        githubReadme : data.readme,
        twoMinutePitch : `I built ${data.title} to help developers and recruiters understand a codebase quickly. It analyzes repository structure, detects the stack, traces APIs from route to middleware to controller to service and database, explains authentication and database design, scores security based on real implementation checks, and generates a README plus interview material. The biggest engineering challenge is making the output trustworthy, so every important finding includes source evidence with file paths and line numbers.`
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
    const codeQuality = analyzeCodeQuality(files,apis,services)
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
        codeQuality,
        techStack,
        authentication,
        database,
        apis,
        security,
        architecture,
        readme : "",
        interviewQuestions,
        projectExplanations : {},
        repositoryWalkthrough : {},
        resumeKit : {},
        qualitySignals : {
            hasTests : files.some(file => file.path.includes("test") || file.path.includes("spec")),
            hasDocker : files.some(file => file.path.toLowerCase().includes("dockerfile") || file.path.includes("docker-compose")),
            hasReadme : files.some(file => file.path.toLowerCase().includes("readme")),
            hasEnvExample : files.some(file => file.path.includes(".env.example"))
        }
    }

    report.projectExplanations = createProjectExplanations(report)
    report.readme = buildReadme(report)
    report.repositoryWalkthrough = createRepositoryWalkthrough(report)
    report.resumeKit = createResumeKit(report)
    report.markdown = buildMarkdownReport(report)

    return report
}

module.exports = {
    analyzeRepository
}
