const mongoose = require('mongoose');
const Counter = require('./Counter');

const taskSchema = new mongoose.Schema({
  taskNum: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    default: 'Pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
});

taskSchema.pre('save', async function (next) {
  const task = this;
    if (task.isNew) {
    try {
      const counter = await Counter.findOneAndUpdate(
        { id: 'taskNum' },       
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );

      task.taskNum = `#TASK-${counter.seq.toString().padStart(6, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
