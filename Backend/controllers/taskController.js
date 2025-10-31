const Task = require("../models/Task");

// ============================
// 📍 Get all tasks
// ============================
exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ message: "Server error while fetching tasks" });
  }
};

// ============================
// 📝 Create a task
// ============================
exports.createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;
    const task = await Task.create({
      user: req.user.id,
      title,
      description,
      status: status || "pending",
      priority: priority || "medium",
      dueDate,
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ message: "Server error while creating task" });
  }
};

// ============================
// 🔄 Update a task
// ============================
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).json({ message: "Server error while updating task" });
  }
};

// ============================
// ❌ Delete a task
// ============================
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (task.user.toString() !== req.user.id)
      return res.status(401).json({ message: "Not authorized" });

    await task.remove();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).json({ message: "Server error while deleting task" });
  }
};

// ============================
// ➕ Add a subtask
// ============================
exports.addSubtask = async (req, res) => {
  try {
    const { title, dueDate } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const sub = { title, dueDate };
    task.subtasks.push(sub);
    await task.save();

    res.json(task);
  } catch (error) {
    console.error("Error adding subtask:", error);
    res.status(500).json({ message: "Server error while adding subtask" });
  }
};

// ============================
// ✏️ Update a subtask
// ============================
exports.updateSubtask = async (req, res) => {
  try {
    const { completed, title, dueDate } = req.body;
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    if (completed !== undefined) subtask.completed = completed;
    if (title) subtask.title = title;
    if (dueDate) subtask.dueDate = dueDate;

    await task.save();
    res.json(task);
  } catch (error) {
    console.error("Error updating subtask:", error);
    res.status(500).json({ message: "Server error while updating subtask" });
  }
};

// ============================
// 🗑️ Delete a subtask
// ============================
exports.deleteSubtask = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
    if (!task) return res.status(404).json({ message: "Task not found" });

    const subtask = task.subtasks.id(req.params.subId);
    if (!subtask) return res.status(404).json({ message: "Subtask not found" });

    subtask.deleteOne();
    await task.save();

    res.json({ message: "Subtask deleted successfully", task });
  } catch (error) {
    console.error("Error deleting subtask:", error);
    res.status(500).json({ message: "Server error while deleting subtask" });
  }
};

// ============================
// 📥 Import tasks from JSON
// ============================
exports.importTasks = async (req, res) => {
  try {
    const tasks = req.body.tasks;
    const importedTasks = [];

    for (const t of tasks) {
      const exists = await Task.findOne({
        user: req.user.id,
        title: t.title,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
      });

      if (!exists) {
        const newTask = new Task({
          ...t,
          user: req.user.id,
        });
        await newTask.save();
        importedTasks.push(newTask);
      }
    }

    res.json({ importedTasks });
  } catch (error) {
    console.error("Error importing tasks:", error);
    res.status(500).json({ error: "Server error while importing tasks" });
  }
};
