import mongoose from 'mongoose';

const evalQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['temporal', 'factual', 'pricing', 'technical', 'entity'],
      default: 'factual',
    },
    expectedMode: {
      type: String,
      required: true,
      enum: ['direct', 'research'],
    },
    groundTruth: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const EvalQuestion = mongoose.model('EvalQuestion', evalQuestionSchema);
