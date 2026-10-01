import React from 'react';
import { ArrowRight, Eye, ShieldCheck, Zap, Award, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';
import { RetinalVisualization } from './RetinalVisualization';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-bg-darkest border-b border-surface-border overflow-hidden">
      {/* Background radial gradient glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent-orange/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-accent-crimson/15 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column Text Content */}
          <div className="lg:col-span-7 space-y-6">
            


            {/* Main Title */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-sans tracking-tight text-text-primary uppercase leading-[0.95]">
              AI That Doesn't Just Screen<span className="text-accent-orange">.</span><br />
              It Explains<span className="text-accent-crimson">.</span>
            </h1>

            {/* Description */}
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl font-normal leading-relaxed">
              Prototype diabetic retinopathy screening with a frozen E2 ordinal EfficientNet-B0, an image-quality gate, and optional Grad-CAM for interpretability.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a href="/screening">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Launch AI Screening
                </Button>
              </a>
              <a href="/explainability">
                <Button variant="brutal" size="lg" icon={<Sparkles className="w-5 h-5 text-accent-orange" />}>
                  Explore XAI Heatmaps
                </Button>
              </a>
            </div>

            {/* Key Trust Metrics */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-surface-border/80">
              <div className="p-3 bg-surface-1/60 border border-surface-border">
                <div className="font-mono text-lg font-black text-accent-orange">E2</div>
                <div className="text-[11px] font-mono uppercase text-text-muted">Ordinal EfficientNet-B0</div>
              </div>
              <div className="p-3 bg-surface-1/60 border border-surface-border">
                <div className="font-mono text-lg font-black text-accent-gold">2.0687</div>
                <div className="text-[11px] font-mono uppercase text-text-muted">Calibration temperature</div>
              </div>
              <div className="p-3 bg-surface-1/60 border border-surface-border">
                <div className="font-mono text-lg font-black text-status-success">0.29</div>
                <div className="text-[11px] font-mono uppercase text-text-muted">Referable threshold</div>
              </div>
              <div className="p-3 bg-surface-1/60 border border-surface-border">
                <div className="font-mono text-xs font-bold text-text-primary mt-1">MathWorks</div>
                <div className="text-[11px] font-mono uppercase text-text-muted">Hackathon Theme</div>
              </div>
            </div>

          </div>

          {/* Right Column Visualization */}
          <div className="lg:col-span-5 flex justify-center">
            <RetinalVisualization />
          </div>

        </div>
      </div>
    </section>
  );
};
