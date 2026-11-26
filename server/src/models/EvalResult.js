import mongoose from 'mongoose';

const evalResultSchema = new mongoose.Schema(
  {
    runId: {
      type: String,
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'EvalQuestion',
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    expectedMode: {
      type: String,
      required: true,
      enum: ['direct', 'research'],
    },
    actualMode: {
      type: String,
      required: true,
      enum: ['direct', 'research'],
    },
    researchScore: {
      type: Number,
      required: true,
    },
    shouldPrompt: {
      type: Boolean,
      required: true,
    },
    directAnswer: {
      type: String,
      default: '',
    },
    directConfidence: {
      type: Number,
      default: null,
    },
    mark: {
      type: String,
      required: true,
      enum: ['passed', 'failed'],
    },
    latencyMs: {
      type: Number,
      default: 0,
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

export const EvalResult = mongoose.model('EvalResult', evalResultSchema);
