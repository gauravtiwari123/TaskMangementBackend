const Task = require('../models/Tasks');
const User = require('../models/Users');
const { getSocket } = require('./../socket');

const createTask = async (req, res) => {
  try {
    const { title, assignedTo, description } = req.body;
    const assignedBy = req.user._id;
    const newTask = new Task({
      title,
      assignedBy,
      assignedTo,
      description,
    });
    const task = await newTask.save();
    const io = getSocket(); 
    io.emit('taskCreated', {
      message: 'A new task has been created',
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ message: 'Error creating task', error });
  }
};

const getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
    const skip = (page - 1) * limit;
    const totalTasks = await Task.countDocuments({ deletedAt: null });
    const tasks = await Task.find({ deletedAt: null })
      .populate('assignedBy', 'id name')
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
};


const getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, deletedAt: null })
      .populate('assignedBy', 'id name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching task', error });
  }
};

const updateTask = async (req, res) => {
  try {
    const { title, status, description } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { title, status, description, updatedAt: new Date() },
      { new: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found or deleted' });
    }
    const io = getSocket();
    io.emit('taskUpdated', {
      message: 'Task has been updated',
      task,
    });
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
};

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, deletedAt: null },
      { deletedAt: new Date(), deletedBy: req.user._id },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found or already deleted' });
    }
    const io = getSocket();
    io.emit('taskDeleted', {
      message: 'Task has been deleted',
      taskId: task._id,
    });
    res.status(200).json({ message: 'Task successfully deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task', error });
  }
};

module.exports = {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
};
