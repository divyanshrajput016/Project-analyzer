const express = require("express")
const {analyzeGithubUrl,analyzeZip,getProjects,compareVersions} = require("../controller/projectController")
const authUser = require("../middleware/authMiddleware")
const upload = require("../middleware/fileMiddleware")

const router = express.Router();

router.post("/analyze-url",authUser,analyzeGithubUrl)
router.post("/analyze-zip",authUser,upload.single("repository"),analyzeZip)
router.get("/",authUser,getProjects)
router.get("/:projectId/compare",authUser,compareVersions)

module.exports = router;

