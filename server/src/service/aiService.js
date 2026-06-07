const {GoogleGenAI} = require("@google/genai")

async function generateAIReport(staticReport,files) {
    if(!process.env.GOOGLE_API_KEY) {
        return staticReport
    }

    try {
        const ai = new GoogleGenAI({apiKey : process.env.GOOGLE_API_KEY})
        const context = files.slice(0,30).map(file => `FILE: ${file.path}\n${file.content.slice(0,2500)}`).join("\n\n")

        const response = await ai.models.generateContent({
            model : "gemini-2.5-pro",
            contents : `Generate a concise production repository analysis report as markdown. Stay grounded in the files. Include overview, architecture, auth, database, APIs, security, README, interview questions, and Mermaid diagrams.\n\nStatic findings:\n${JSON.stringify(staticReport,null,2)}\n\nRepository context:\n${context}`
        })

        const markdown = response.text || staticReport.markdown

        return {
            ...staticReport,
            markdown,
            readme : markdown
        }
    } catch (error) {
        console.error(error);
        return staticReport
    }
}

async function answerRepositoryQuestion(question,report) {
    if(!process.env.GOOGLE_API_KEY) {
        return buildGroundedFallbackAnswer(question,report,"AI is not configured")
    }

    try {
        const ai = new GoogleGenAI({apiKey : process.env.GOOGLE_API_KEY})
        const response = await ai.models.generateContent({
            model : "gemini-2.5-pro",
            contents : `Answer only from this repository report. If the answer is not in context, say that the report does not contain enough context. Use markdown and this exact structure:

## Direct Answer
Answer the question briefly from repository context only.

## Evidence Files
- file:line - why it matters

## Relevant Route / Controller / Model
Name the relevant route, controller, middleware, service, model, or external API.

## Confidence
High, Medium, or Low with one sentence.

## Suggested Follow-up Questions
- question
- question
- question

Question: ${question}

Report:
${JSON.stringify(report,null,2)}`
        })

        return response.text
    } catch (error) {
        console.error(error);
        return buildGroundedFallbackAnswer(question,report,"Gemini quota or API error")
    }
}

function buildGroundedFallbackAnswer(question,report,reason) {
    const lower = question.toLowerCase()
    let relevantApis = report.apis || []

    if(lower.includes("login") || lower.includes("auth")) {
        relevantApis = relevantApis.filter(api => api.path.toLowerCase().includes("auth") || api.controller?.toLowerCase().includes("auth") || api.path.toLowerCase().includes("login"))
    }

    if(lower.includes("database") || lower.includes("schema") || lower.includes("model")) {
        relevantApis = []
    }

    const evidence = []
        .concat((relevantApis[0]?.citations || []).slice(0,3))
        .concat((report.authentication?.jwtGeneration || []).slice(0,2))
        .concat((report.authentication?.jwtVerification || []).slice(0,2))
        .concat((report.database?.models || []).slice(0,2).map(model => model.source).filter(Boolean))
        .filter(Boolean)

    const route = relevantApis[0]
    const model = report.database?.models?.[0]

    return `## Direct Answer
${reason}. Based on the saved repository report, ${report.title} uses ${report.techStack?.join(", ") || "the detected stack"} with ${report.apis?.length || 0} API routes, ${report.database?.models?.length || 0} database models, and ${report.authentication?.type || "unknown"} authentication.

## Evidence Files
${evidence.length ? evidence.map(item => `- ${item.file}:${item.line} - ${item.code || "source evidence"}`).join("\n") : "- No exact evidence file was available in the saved report for this question."}

## Relevant Route / Controller / Model
${route ? `Route: ${route.method} ${route.path}\nController: ${route.controller || "not detected"}\nMiddleware: ${(route.middleware || []).join(" -> ") || "none"}` : model ? `Model: ${model.name}\nPurpose: ${model.purpose}\nFields: ${(model.keyFields || model.fields || []).join(", ")}` : "No matching route/controller/model was found in the saved report."}

## Confidence
${evidence.length ? "Medium" : "Low"}. This answer is limited to static report context and does not invent details outside the repository.

## Suggested Follow-up Questions
- Explain authentication flow
- Explain database schema
- Find security issues`
}

module.exports = {
    generateAIReport,
    answerRepositoryQuestion
}
