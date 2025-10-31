const express = require('express');
const Task = require('../models/Task');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching tasks for user:', req.user._id);
    const tasks = await Task.find({ user: req.user._id }).sort({ createdAt: -1 });
    console.log('Tasks found:', tasks.length);
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create task
router.post('/', auth, async (req, res) => {
  try {
    console.log('Creating task for user:', req.user._id);
    console.log('Task data:', req.body);
    
    const task = new Task({
      title: req.body.title,
      description: req.body.description,
      status: req.body.status || 'pending',
      priority: req.body.priority || 'medium',
      dueDate: req.body.dueDate,
      user: req.user._id,
    });
    
    const savedTask = await task.save();
    console.log('Task created successfully:', savedTask);
    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    console.log('Updating task:', req.params.id);
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      console.log('Task not found for user');
      return res.status(404).json({ message: 'Task not found' });
    }

    // Update only allowed fields
    const allowedUpdates = ['title', 'description', 'status', 'priority', 'dueDate'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    const updatedTask = await task.save();
    console.log('Task updated successfully:', updatedTask);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log('Deleting task:', req.params.id);
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    
    if (!task) {
      console.log('Task not found for user');
      return res.status(404).json({ message: 'Task not found' });
    }

    await Task.deleteOne({ _id: req.params.id });
    console.log('Task deleted successfully');
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;