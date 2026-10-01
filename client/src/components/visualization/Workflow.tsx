import React from 'react';
import { Camera, ShieldCheck, Cpu, Sparkles, Activity } from 'lucide-react';

const steps = [
  ['Upload fundus image', 'The browser sends the selected image bytes to the FastAPI screening route.', Camera],
  ['Quality gate', 'Fundus coverage, focus, and illumination determine whether the image can proceed.', ShieldCheck],
  ['Model inference', 'Gradable images are processed by the frozen E2 ordinal EfficientNet-B0 and calibration.', Cpu],
  ['Grad-CAM', 'The backend may return the conv_head attention map for a quality-passing image.', Sparkles],
  ['Reliability and triage', 'The backend returns probabilities, P(Grade 2–4), and an engineering triage state.', Activity],
] as const;

export const Workflow: React.FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
    {steps.map(([title, desc, Icon], index) => (
      <article key={title} className="brutal-card p-5 space-y-3">
        <div className="flex items-center justify-between"><span className="font-mono text-xl font-bold text-accent-orange">0{index + 1}</span><Icon className="w-5 h-5 text-accent-orange" /></div>
        <h3 className="font-mono text-sm font-bold text-text-primary uppercase">{title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
      </article>
    ))}
  </div>
);
