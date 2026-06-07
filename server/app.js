require("dotenv").config()
const express = require("express")
const cookieParser = require("cookie-parser")
const cors = require("cors")
const connectDB = require("./src/config/db")

const authRoutes = require("./src/routes/authRoutes")

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

module.exports = app

