import React from 'react';

export const ExplanationPanel: React.FC = () => (
  <div className="brutal-card p-6 space-y-3">
    <h3 className="font-mono text-sm font-bold uppercase text-text-primary">Live explanation</h3>
    <p className="text-xs text-text-secondary">Upload an image on the screening page to see its backend-generated Grad-CAM, when available.</p>
    <p className="text-xs text-text-muted">No sample confidence, lesion findings, or synthetic attention map is shown here.</p>
  </div>
);
