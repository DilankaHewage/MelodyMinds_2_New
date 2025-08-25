import mongoose from 'mongoose';

const likeSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

// Ensure a user can only like an event once
likeSchema.index({ event: 1, user: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

export default Like;
