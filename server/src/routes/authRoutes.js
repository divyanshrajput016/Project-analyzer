const express = require("express")
const {registerUser,loginUser,logoutUser,getMe} = require("../controller/authController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/logout",logoutUser)
router.get("/get-me",authUser,getMe)

module.exports = router;
