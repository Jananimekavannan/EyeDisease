import React from 'react';
import { Eye, Shield, Activity, Cpu, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-bg-darkest border-t border-surface-border text-text-secondary pt-16 pb-12 relative overflow-hidden">
      {/* Accent subtle background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Top Disclaimer Banner */}
        <div className="mb-12 p-4 bg-surface-1 border border-accent-orange/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent-gold flex-shrink-0" />
            <p className="text-xs font-mono text-text-secondary leading-normal">
              <span className="font-bold text-accent-gold uppercase">CLINICAL SAFETY DISCLAIMER:</span> AI-assisted screening is intended to support healthcare professionals and does not replace clinical diagnosis. Results must be reviewed by a qualified ophthalmologist.
            </p>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-accent-orange px-2 py-1 bg-accent-orange/10 border border-accent-orange/30 whitespace-nowrap">
            Clinical XAI Compliant
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-surface-border">
          
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <a href="/" className="flex items-center gap-3 group">
              <div className="w-11 h-11 bg-white border border-accent-orange flex items-center justify-center shadow-brutal rounded overflow-hidden flex-shrink-0">
                <img 
                  src="/logo.png" 
                  alt="Retina-X Logo" 
                  className="w-full h-full object-contain p-0.5" 
                />
              </div>
              <span className="font-mono font-black text-xl text-text-primary uppercase tracking-wider">
                RETINA<span className="text-accent-orange">-X</span>
              </span>
            </a>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              Royal Medical AI Command Center for Explainable Diabetic Retinopathy Screening in Rural India.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs font-mono text-text-muted">
              <span>Explainable AI</span>
              <span>•</span>
              <span>Ophthalmology</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="font-mono text-xs uppercase font-bold text-text-primary tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-orange" />
              Platform Modules
            </h4>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <a href="/screening" className="hover:text-accent-orange transition-colors flex items-center gap-1">
                  <span>Retinal AI Workstation</span>
                  <ArrowUpRight className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <a href="/explainability" className="hover:text-accent-orange transition-colors flex items-center gap-1">
                  <span>Grad-CAM Explainability</span>
                  <ArrowUpRight className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <a href="/dashboard" className="hover:text-accent-orange transition-colors flex items-center gap-1">
                  <span>Doctor Dashboard</span>
                  <ArrowUpRight className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <a href="/patients" className="hover:text-accent-orange transition-colors flex items-center gap-1">
                  <span>Patient Profiles</span>
                  <ArrowUpRight className="w-3 h-3 text-text-muted" />
                </a>
              </li>
              <li>
                <a href="/reports" className="hover:text-accent-orange transition-colors flex items-center gap-1">
                  <span>Clinical Reports</span>
                  <ArrowUpRight className="w-3 h-3 text-text-muted" />
                </a>
              </li>
            </ul>
          </div>

          {/* Architecture & Tech */}
          <div>
            <h4 className="font-mono text-xs uppercase font-bold text-text-primary tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-crimson" />
              Deep Learning Stack
            </h4>
            <ul className="space-y-2.5 text-xs font-mono text-text-secondary">
              <li className="flex items-center justify-between">
                <span>Model Architecture</span>
                <span className="text-accent-gold">ResNet50 / ConvNeXt</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Explainability Engine</span>
                <span className="text-accent-gold">Grad-CAM + Layer-CAM</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Vessel Segmentation</span>
                <span className="text-accent-gold">U-Net Feature Map</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Low-Bandwidth Pipeline</span>
                <span className="text-accent-gold">ONNX Offline Runtime</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Backend API</span>
                <span className="text-accent-gold">Node / Express API</span>
              </li>
            </ul>
          </div>

          {/* Rural Last Mile */}
          <div>
            <h4 className="font-mono text-xs uppercase font-bold text-text-primary tracking-widest mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-accent-gold" />
              Rural Impact Focus
            </h4>
            <p className="text-xs text-text-secondary mb-3 leading-relaxed">
              Designed to empower Accredited Social Health Activists (ASHA) and rural health workers in non-networked clinics across tier-3 and village centers.
            </p>
            <div className="p-3 bg-surface-1 border border-surface-border text-[11px] font-mono text-text-muted">
              <span className="text-accent-gold font-bold">Domain Focus:</span> Explainable Ophthalmology<br />
              <span className="text-text-secondary">Theme: Healthcare & Explainable AI</span>
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-text-muted">
          <div>
            © 2026 RETINA-X Platform. All Rights Reserved. Smart India Hackathon Demonstration.
          </div>
          <div className="flex items-center gap-6">
            <a href="/architecture" className="hover:text-text-primary transition-colors">Technical Spec</a>
            <a href="/about" className="hover:text-text-primary transition-colors">Mission Vision</a>
            <span className="text-accent-orange font-bold">ROYAL MEDICAL UI</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
