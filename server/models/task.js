const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    default: "",
    trim: true,
  },
  status: {
    type: String,
    enum: ["Todo", "In Progress", "Done"],
    default: "Todo",
    index: true,
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High"],
    default: "Medium",
    index: true,
  },
  dueDate: {
    type: Date,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

taskSchema.virtual("computedStatus").get(function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(this.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today && this.status !== "Done") {
    return "Overdue";
  }

  return this.status;
});

taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ createdBy: 1, priority: 1 });
taskSchema.index({ createdBy: 1, dueDate: 1 });
taskSchema.index({ title: "text" });

module.exports = mongoose.model("Task", taskSchema);
