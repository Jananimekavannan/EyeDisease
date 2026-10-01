import React from 'react';
import { ArrowDown, Cpu, Eye, Layers, Server, Sparkles } from 'lucide-react';

const stages = [
  ['React upload', 'Selected image bytes are sent as multipart form data.', Layers],
  ['FastAPI quality gate', 'Fundus coverage, masked focus, and illumination determine gradability.', Eye],
  ['Frozen E2 ordinal EfficientNet-B0', 'crop_pad_512 preprocessing, 224×224 input, calibrated grade 0–4 probabilities.', Cpu],
  ['Grad-CAM and reliability', 'Quality-passing images may receive a conv_head attention map; backend triage uses calibrated output.', Sparkles],
  ['JSON response', 'The screening UI renders the backend response. Lesion detection is unavailable.', Server],
] as const;

export const ArchitectureDiagram: React.FC = () => (
  <div className="space-y-3 max-w-4xl mx-auto">
    {stages.map(([title, description, Icon], index) => (
      <React.Fragment key={title}>
        <div className="brutal-card p-5 flex items-start gap-4 border-l-4 border-l-accent-orange">
          <Icon className="w-5 h-5 text-accent-orange shrink-0" />
          <div><h3 className="font-mono text-xs font-bold uppercase text-text-primary">{title}</h3><p className="text-xs text-text-secondary mt-1">{description}</p></div>
        </div>
        {index < stages.length - 1 && <ArrowDown className="mx-auto w-4 h-4 text-accent-orange" />}
      </React.Fragment>
    ))}
  </div>
);
