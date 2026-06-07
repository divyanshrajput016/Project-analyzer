const express = require("express")
const {getUsers,getAnalytics,deleteAbusiveReport} = require("../controller/adminController")
const authUser = require("../middleware/authMiddleware")
const allowRoles = require("../middleware/roleMiddleware")

const router = express.Router();

router.get("/users",authUser,allowRoles("admin"),getUsers)
router.get("/analytics",authUser,allowRoles("admin"),getAnalytics)
router.delete("/reports/:id",authUser,allowRoles("admin"),deleteAbusiveReport)

module.exports = router;

