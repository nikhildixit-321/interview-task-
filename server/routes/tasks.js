const express = require("express");
const requireAuth = require("../middleware/auth");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
} = require("../controllers/taskController");

const router = express.Router();

router.use(requireAuth);

router.post("/", createTask);
router.get("/", getTasks);
router.get("/stats", getTaskStats);
router.patch("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
