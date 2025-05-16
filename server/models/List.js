const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  phone: { type: String, required: true }, // Storing as String to accommodate various formats, validation can be added
  notes: { type: String }
});

const ListSchema = new mongoose.Schema({
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agent',
    required: true
  },
  tasks: [TaskSchema],
  originalFileName: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('List', ListSchema); 