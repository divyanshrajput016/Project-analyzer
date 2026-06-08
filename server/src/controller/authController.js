const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const crypto = require("crypto")
const userModel = require("../models/user")
const blacklistModel = require("../models/blacklist")
const projectModel = require("../models/project")

function createToken(user) {
    return jwt.sign({
        id : user._id,
        name : user.name,
        email : user.email,
        role : user.role,
        time : new Date()
    },process.env.JWT_SECRET,{
        expiresIn : "1d",
        jwtid : crypto.randomUUID()
    })
}

function setTokenCookie(res,token) {
    const isProduction = process.env.NODE_ENV === "production"

    res.cookie("token",token,{
        httpOnly : true,
        sameSite : isProduction ? "none" : "lax",
        secure : isProduction,
        maxAge : 24 * 60 * 60 * 1000
    });
}

async function registerUser(req,res) {
    const {name,email,password} = req.body

    if(!name || !email || !password) {
        return res.status(400).json({
            message : "All fields are required"
        })
    }

    if(password.length < 6) {
        return res.status(400).json({
            message : "Password must be at least 6 characters"
        })
    }

    const existingUser = await userModel.findOne({email})

    if(existingUser) {
        return res.status(409).json({
            message : "Email already exists"
        })
    }

    const hash = await bcrypt.hash(password,10)

    const user = await userModel.create({
        name,
        email,
        password : hash
    })

    const token = createToken(user)
    setTokenCookie(res,token)

    return res.status(201).json({
        message : "User registered successfully",
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }
    })
}

async function loginUser(req,res) {
    const {email,password} = req.body

    if(!email || !password) {
        return res.status(400).json({
            message : "All fields are required"
        })
    }

    const user = await userModel.findOne({email})

    if(!user) {
        return res.status(409).json({
            message : "User not Found"
        })
    }

    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch) {
        return res.status(401).json({
            message : "Invalid credentials"
        })
    }

    const token = createToken(user)
    setTokenCookie(res,token)

    return res.status(200).json({
        message : "User logged in successfully",
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt
        }
    })
}

async function logoutUser(req,res) {
    const token = req.cookies.token;

    if(token) {
        await blacklistModel.create({token})
    }

    res.clearCookie("token",{
        httpOnly : true,
        sameSite : process.env.NODE_ENV === "production" ? "none" : "lax",
        secure : process.env.NODE_ENV === "production"
    })

    return res.status(200).json({
        message : "User logged out successfully"
    })
}

async function getMe(req,res) {
    const user = await userModel.findById(req.user.id).select("-password")
    const totalAnalyzedRepositories = await projectModel.countDocuments({user : req.user.id})

    if(!user) {
        return res.status(404).json({
            message : "User not found"
        })
    }

    return res.status(200).json({
        user : {
            id : user._id,
            name : user.name,
            email : user.email,
            role : user.role,
            createdAt : user.createdAt,
            totalAnalyzedRepositories
        }
    })
}

module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    getMe
}
