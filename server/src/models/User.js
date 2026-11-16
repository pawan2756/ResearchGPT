import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    settings: {
      depth: {
        type: String,
        enum: ['quick', 'deep'],
        default: 'quick',
      },
      allowlist: {
        type: [String],
        default: [],
      },
      blocklist: {
        type: [String],
        default: [],
      },
      theme: {
        type: String,
        enum: ['system', 'light', 'dark'],
        default: 'system',
      },
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        return ret;
      },
    },
  }
);

export const User = mongoose.model('User', userSchema);
