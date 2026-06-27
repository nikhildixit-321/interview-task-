const Task = require("../models/task");
const mongoose = require("mongoose");

const allowedTransitions = {
  Todo: ["In Progress"],
  "In Progress": ["Todo", "Done"],
  Done: ["In Progress"],
};

const getTodayStart = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

const addComputedStatus = (task) => {
  const obj = task.toObject ? task.toObject() : task;
  const dueDate = new Date(obj.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return {
    ...obj,
    computedStatus: dueDate < getTodayStart() && obj.status !== "Done" ? "Overdue" : obj.status,
  };
};

const getUserObjectId = (req) => new mongoose.Types.ObjectId(req.user.id);

const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: req.user.id,
    });

    return res.status(201).json({ task: addComputedStatus(task) });
  } catch (error) {
    return next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
    const skip = (page - 1) * limit;

    const match = { createdBy: getUserObjectId(req) };

    if (req.query.priority) {
      match.priority = req.query.priority;
    }

    if (req.query.status === "Overdue") {
      match.status = { $ne: "Done" };
      match.dueDate = { $lt: getTodayStart() };
    } else if (req.query.status) {
      match.status = req.query.status;
    }

    if (req.query.search) {
      match.title = { $regex: req.query.search, $options: "i" };
    }

    const result = await Task.aggregate([
      { $match: match },
      {
        $addFields: {
          priorityOrder: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "High"] }, then: 1 },
                { case: { $eq: ["$priority", "Medium"] }, then: 2 },
                { case: { $eq: ["$priority", "Low"] }, then: 3 },
              ],
              default: 4,
            },
          },
        },
      },
      { $sort: { priorityOrder: 1, dueDate: 1, createdAt: -1 } },
      {
        $facet: {
          tasks: [{ $skip: skip }, { $limit: limit }, { $project: { priorityOrder: 0 } }],
          total: [{ $count: "count" }],
        },
      },
    ]);

    const tasks = (result[0]?.tasks || []).map(addComputedStatus);
    const total = result[0]?.total[0]?.count || 0;

    return res.json({
      tasks,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, createdBy: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    const { title, description, status, priority, dueDate } = req.body;

    if (status && status !== task.status) {
      const validNextStatuses = allowedTransitions[task.status] || [];
      if (!validNextStatuses.includes(status)) {
        return res.status(400).json({
          message: `Invalid status move: ${task.status} to ${status}`,
        });
      }
      task.status = status;
    }

    if (title !== undefined) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority !== undefined) task.priority = priority;
    if (dueDate !== undefined) task.dueDate = dueDate;

    await task.save();

    return res.json({ task: addComputedStatus(task) });
  } catch (error) {
    return next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, createdBy: req.user.id });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    return res.json({ message: "Task deleted" });
  } catch (error) {
    return next(error);
  }
};

const getTaskStats = async (req, res, next) => {
  try {
    const [stats] = await Task.aggregate([
      { $match: { createdBy: getUserObjectId(req) } },
      {
        $facet: {
          total: [{ $count: "count" }],
          completed: [{ $match: { status: "Done" } }, { $count: "count" }],
          overdue: [
            { $match: { status: { $ne: "Done" }, dueDate: { $lt: getTodayStart() } } },
            { $count: "count" },
          ],
          priorityGroups: [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
        },
      },
    ]);

    const groupedByPriority = { High: 0, Medium: 0, Low: 0 };
    for (const item of stats.priorityGroups || []) {
      groupedByPriority[item._id] = item.count;
    }

    return res.json({
      totalTasks: stats.total[0]?.count || 0,
      completedTasks: stats.completed[0]?.count || 0,
      overdueTasks: stats.overdue[0]?.count || 0,
      groupedByPriority,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getTaskStats,
};
