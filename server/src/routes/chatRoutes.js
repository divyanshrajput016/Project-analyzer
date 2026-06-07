const express = require("express")
const {askRepository,getChatHistory} = require("../controller/chatController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.post("/:projectId",authUser,askRepository)
router.get("/:projectId",authUser,getChatHistory)

module.exports = router;

