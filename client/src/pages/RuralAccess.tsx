import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { SectionHeader } from '../components/common/SectionHeader';
import { RuralSimulation } from '../components/visualization/RuralSimulation';
import { Smartphone, CheckCircle, Heart } from 'lucide-react';

export const RuralAccess: React.FC = () => {
  return (
    <PublicLayout activePath="/rural-access">
      <div className="pt-28 pb-20 bg-bg-darkest min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <SectionHeader
            number="08"
            eyebrow="Accessible Engineering"
            title="BUILT FOR THE LAST MILE"
            description="Engineered specifically to support ASHA health workers in low-bandwidth, non-networked rural health camps."
          />

          {/* Interactive Rural Capacity Evaluator Simulation */}
          <RuralSimulation />

          {/* Key Engineering Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-surface-border">
            <div className="brutal-card p-6 space-y-3">
              <Smartphone className="w-8 h-8 text-accent-orange" />
              <h3 className="font-mono text-base font-bold uppercase text-text-primary">Offline-First ONNX Engine</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Runs deep neural inference directly inside browser client or local tablet without requiring continuous internet connectivity.
              </p>
            </div>
            <div className="brutal-card p-6 space-y-3">
              <CheckCircle className="w-8 h-8 text-accent-gold" />
              <h3 className="font-mono text-base font-bold uppercase text-text-primary">Simplified Worker Workflow</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Intuitive tap-based registration and automated image quality check prevents user error in field conditions.
              </p>
            </div>
            <div className="brutal-card p-6 space-y-3">
              <Heart className="w-8 h-8 text-status-success" />
              <h3 className="font-mono text-base font-bold uppercase text-text-primary">Doctor Tele-Referral</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Automatically queues high-risk cases for remote ophthalmologist verification when internet sync is restored.
              </p>
            </div>
          </div>

        </div>
      </div>
    </PublicLayout>
  );
};
