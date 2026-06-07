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
        return "AI is not configured. Based on the saved report, please review the generated sections for repository-specific details."
    }

    try {
        const ai = new GoogleGenAI({apiKey : process.env.GOOGLE_API_KEY})
        const response = await ai.models.generateContent({
            model : "gemini-2.5-pro",
            contents : `Answer only from this repository report. If the answer is not in context, say that the report does not contain enough context. Use markdown. When you reference routes, controllers, models, middleware, or services, include a short "Sources" section with file paths from the report.\n\nQuestion: ${question}\n\nReport:\n${JSON.stringify(report,null,2)}`
        })

        return response.text
    } catch (error) {
        console.error(error);
        return "Error generating repository answer"
    }
}

module.exports = {
    generateAIReport,
    answerRepositoryQuestion
}
