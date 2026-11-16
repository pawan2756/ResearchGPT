import mongoose from 'mongoose';

const sourceItemSchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    title: { type: String, default: '' },
    url: { type: String, required: true },
    domain: { type: String, default: '' },
    score: { type: Number, default: 0 },
    band: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
    snippet: { type: String, default: '' },
    chunk: { type: String, default: '' },
  },
  { _id: false }
);

const claimVerificationSchema = new mongoose.Schema(
  {
    claim: { type: String, required: true },
    supported: { type: Boolean, required: true },
    sourceId: { type: Number, default: null },
    evidence: { type: String, default: null },
  },
  { _id: false }
);

const verificationSchema = new mongoose.Schema(
  {
    total: { type: Number, default: 0 },
    supported: { type: Number, default: 0 },
    claims: { type: [claimVerificationSchema], default: [] },
  },
  { _id: false }
);

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mode: {
      type: String,
      enum: ['direct', 'research'],
      default: 'direct',
    },
    confidence: {
      type: Number,
      min: 0,
      max: 10,
      default: null,
    },
    needsResearch: {
      type: Boolean,
      default: false,
    },
    researchScore: {
      type: Number,
      default: 0,
    },
    signals: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    sources: {
      type: [sourceItemSchema],
      default: [],
    },
    excludedCount: {
      type: Number,
      default: 0,
    },
    verification: {
      type: verificationSchema,
      default: null,
    },
    notFound: {
      type: Boolean,
      default: false,
    },
    latencyMs: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
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

export const Message = mongoose.model('Message', messageSchema);
