require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const connectDB = require("./src/config/db")

const authRoutes = require("./src/routes/authRoutes")
const dashboardRoutes = require("./src/routes/dashboardRoutes")
const reportRoutes = require("./src/routes/reportRoutes")
const adminRoutes = require("./src/routes/adminRoutes")
const projectRoutes = require("./src/routes/projectRoutes")
const chatRoutes = require("./src/routes/chatRoutes")
const interviewRoutes = require("./src/routes/interviewRoutes")

const app = express();

app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}));

app.use(express.json({limit : "10mb"}))
app.use(cookieParser())

connectDB();

app.get("/api/health",(req,res) => {
    res.status(200).json({message : "CodeAtlas API is running"})
})

app.use("/api/auth",authRoutes)
app.use("/api/dashboard",dashboardRoutes)
app.use("/api/reports",reportRoutes)
app.use("/api/admin",adminRoutes)
app.use("/api/projects",projectRoutes)
app.use("/api/chat",chatRoutes)
app.use("/api/interview",interviewRoutes)

module.exports = app
