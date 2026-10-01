import React from 'react';

export const RetinalVisualization: React.FC = () => (
  <figure className="w-full max-w-[500px] mx-auto space-y-2">
    <img
      src="/real_retina.png"
      alt="Fundus regression image preview; no model output is overlaid"
      className="w-full aspect-square object-cover rounded-full border-2 border-accent-orange"
    />
    <figcaption className="text-center font-mono text-[10px] text-text-muted">
      Regression image preview · no synthetic Grad-CAM or lesion marks
    </figcaption>
  </figure>
);
