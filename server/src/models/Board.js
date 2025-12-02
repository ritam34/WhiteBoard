import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

const boardSchema = new mongoose.Schema({
  boardId: {
    type: String,
    unique: true,
    index: true,
    default: () => nanoid(10)
  },
  title: {
    type: String,
    default: 'Untitled Board',
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  collaborators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  boardState: {
    type: Object,
    default: {
      version: '5.3.0',
      objects: []
    }
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  thumbnail: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

boardSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

boardSchema.index({ createdBy: 1, createdAt: -1 });

export default mongoose.model('Board', boardSchema);
