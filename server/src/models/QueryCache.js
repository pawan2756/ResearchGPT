import mongoose from 'mongoose';

const queryCacheSchema = new mongoose.Schema(
  {
    queryHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    results: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index
    },
  },
  { timestamps: true }
);

export const QueryCache = mongoose.model('QueryCache', queryCacheSchema);
