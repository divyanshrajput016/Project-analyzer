const express = require("express")
const {getAllReports,getReportById,deleteReport,exportMarkdown,exportReadme,exportDiagram,exportPdf} = require("../controller/reportController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.get("/",authUser,getAllReports)
router.get("/:id",authUser,getReportById)
router.delete("/:id",authUser,deleteReport)
router.get("/:id/export/markdown",authUser,exportMarkdown)
router.get("/:id/export/readme",authUser,exportReadme)
router.get("/:id/export/diagram",authUser,exportDiagram)
router.get("/:id/export/pdf",authUser,exportPdf)

module.exports = router;
