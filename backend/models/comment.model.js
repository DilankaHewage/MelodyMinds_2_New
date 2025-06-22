import mongoose from 'mongoose';

const commentSchema = mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true
    },
    userName: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);

export default Comment; 