const mongoose = require('mongoose');

// Subtask Schema
const subtaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
  createdAt: { type: Date, default: Date.now }
}, { _id: true }); // ✅ auto id create karega

// Main Task Schema
const taskSchema = new mongoose.Schema({
  dependencies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  blockedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
  }],
  subtasks: [subtaskSchema], // ✅ use embedded schema
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low'
  },
  dueDate: {
    type: Date
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
