const express = require("express")
const {getAllReports,getReportById,deleteReport,exportMarkdown} = require("../controller/reportController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.get("/",authUser,getAllReports)
router.get("/:id",authUser,getReportById)
router.delete("/:id",authUser,deleteReport)
router.get("/:id/export/markdown",authUser,exportMarkdown)

module.exports = router;

