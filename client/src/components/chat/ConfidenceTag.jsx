import React from 'react';
import { Tag } from '../ui/Tag.jsx';

export function ConfidenceTag({ confidence }) {
  if (confidence === null || confidence === undefined) {
    return null;
  }

  const isLow = confidence < 5;
  const variant = isLow ? 'warning' : 'success';

  return (
    <Tag variant={variant} size="xs" title={`Model confidence score: ${confidence} out of 10`}>
      <span>Confidence: {confidence}/10</span>
      {isLow && <span className="opacity-75">(Low)</span>}
    </Tag>
  );
}
