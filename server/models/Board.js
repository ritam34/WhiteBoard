import mongoose from "mongoose";

const BoardSchema = new mongoose.Schema(
  {
    boardId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      default: "Untitled Board",
    },
    boardState: {
      type: mongoose.Schema.Types.Mixed,
      default: { version: "5.3.0", objects: [] },
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    collaborators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    password: {
      type: String,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },

    lastModified: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      totalObjects: {
        type: Number,
        default: 0,
      },
      activeUsers: {
        type: Number,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

BoardSchema.index({ createdAt: -1 });
BoardSchema.index({ createdBy: 1, createdAt: -1 });

BoardSchema.pre("save", function (next) {
  this.lastModified = new Date();
  next();
});

export default mongoose.model("Board", BoardSchema);
