const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist")

async function authUser(req,res,next) {
    const token = req.cookies.token;

    if(!token) {
        return res.status(401).json({
            message : "token not provided"
        })
    }

    const istokenBlacklisted = await blacklistModel.findOne({token})

    if(istokenBlacklisted) {
        return res.status(401).json({
            message : "token is blacklisted"
        })
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded
        next();
    } catch(error) {
        return res.status(401).json({
            message : "invalid token or expired"
        })
    }
}

module.exports = authUser

