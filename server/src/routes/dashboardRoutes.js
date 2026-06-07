const express = require("express")
const {getDashboard} = require("../controller/dashboardController")
const authUser = require("../middleware/authMiddleware")

const router = express.Router();

router.get("/",authUser,getDashboard)

module.exports = router;

