const express = require("express")
const {getInterviewMode} = require("../controller/interviewController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.get("/:projectId",authUser,getInterviewMode)

module.exports = router;

