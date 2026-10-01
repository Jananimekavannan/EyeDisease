import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { Hero } from '../components/hero/Hero';
import { SectionHeader } from '../components/common/SectionHeader';
import { Workflow } from '../components/visualization/Workflow';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { ArrowRight, ShieldCheck, Cpu, Eye, Activity, Award, Heart, CheckCircle, Smartphone, AlertTriangle } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <PublicLayout activePath="/">
      
      {/* 01 — Hero Section */}
      <Hero />

      {/* 02 — Problem Section (Brutalist Editorial Layout) */}
      <section className="py-20 bg-bg-dark border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="02"
            eyebrow="The Rural Healthcare Challenge"
            title="THE PROBLEM"
            description="Diabetic retinopathy can cause preventable vision loss when screening and follow-up are delayed in non-networked rural clinics."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="brutal-card p-6 border-l-4 border-l-accent-crimson space-y-3">
                <span className="font-mono text-xs uppercase font-bold text-accent-crimson">
                  77+ MILLION DIABETIC PATIENTS IN INDIA
                </span>
                <p className="text-sm md:text-base text-text-primary leading-relaxed font-sans">
                  Over <strong className="text-accent-orange">80% of rural patients</strong> lack timely access to ophthalmologists. Traditional screening requires dilated eye exams and expensive specialized equipment unavailable at primary health centers (PHC).
                </p>
              </div>

              {/* Patient -> Doctor Workflow Pipeline Visualization */}
              <div className="p-6 bg-surface-1 border border-surface-border space-y-4">
                <span className="font-mono text-xs uppercase font-bold text-accent-gold block">
                  RURAL DR SCREENING PIPELINE
                </span>
                
                <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-text-secondary">
                  <span className="px-2.5 py-1 bg-surface-2 border border-surface-border text-text-primary font-bold">Patient</span>
                  <span className="text-accent-orange">→</span>
                  <span className="px-2.5 py-1 bg-surface-2 border border-surface-border text-text-primary">ASHA Worker</span>
                  <span className="text-accent-orange">→</span>
                  <span className="px-2.5 py-1 bg-surface-2 border border-surface-border text-text-primary">Fundus Scan</span>
                  <span className="text-accent-orange">→</span>
                  <span className="px-2.5 py-1 bg-accent-orange/20 border border-accent-orange text-accent-orange font-bold">XAI Screening</span>
                  <span className="text-accent-orange">→</span>
                  <span className="px-2.5 py-1 bg-surface-2 border border-surface-border text-text-primary">Doctor Verification</span>
                  <span className="text-accent-orange">→</span>
                  <span className="px-2.5 py-1 bg-status-success/20 border border-status-success text-status-success font-bold">Referral</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="brutal-card p-6">
                <div className="font-mono text-4xl font-black text-accent-orange mb-1">80%</div>
                <div className="font-mono text-xs uppercase font-bold text-text-primary">Preventable Blindness</div>
                <p className="text-xs text-text-secondary mt-2">
                  When detected early via AI screening, diabetic vision loss can be treated or halted in over 90% of cases.
                </p>
              </div>
              <div className="brutal-card p-6">
                <div className="font-mono text-4xl font-black text-accent-gold mb-1">1:25,000</div>
                <div className="font-mono text-xs uppercase font-bold text-text-primary">Doctor-to-Patient Ratio</div>
                <p className="text-xs text-text-secondary mt-2">
                  Rural India faces a severe scarcity of retina specialists. RETINA-X bridges this critical screening gap.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 03 — Screening Workflow */}
      <section className="py-20 bg-bg-darkest border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="03"
            eyebrow="Step-by-Step Clinical Protocol"
            title="SCREENING WORKFLOW"
            description="End-to-end patient journey from village outreach registration to ophthalmologist referral."
          />
          <Workflow />
        </div>
      </section>

      {/* 04 — AI Screening Interactive Teaser */}
      <section className="py-20 bg-bg-dark border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="04"
            eyebrow="Live fundus image analysis"
            title="AI SCREENING EXPERIENCE"
            description="Upload retinal fundus images and receive E2 ordinal DR severity predictions with Grad-CAM interpretability."
          />

          <div className="brutal-card p-8 bg-surface-1 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-orange/10 border border-accent-orange text-accent-orange font-mono text-xs font-bold uppercase">
              <Cpu className="w-4 h-4" /> Backend screening pipeline
            </div>

            <h3 className="text-2xl md:text-4xl font-black font-sans uppercase text-text-primary max-w-2xl mx-auto">
              Ready to test the Explainable AI Screening Workstation?
            </h3>
            <p className="text-sm text-text-secondary max-w-xl mx-auto font-sans pb-2">
              Upload a fundus image. The backend checks quality first, then returns model probabilities, triage, and Grad-CAM when available.
            </p>

            <div className="pt-4 flex justify-center">
              <a href="/screening">
                <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Launch Screening Workstation
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 05 & 06 — Explainable AI & Retinal Analysis */}
      <section className="py-20 bg-bg-darkest border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="05"
            eyebrow="Clinical Trust & Transparency"
            title="EXPLAINABLE AI (XAI)"
            description="For quality-passing uploads, the backend can return a Grad-CAM map from the frozen E2 model. It is an interpretability aid, not lesion detection or clinical proof."
          />

          <div className="brutal-card p-6 space-y-3 font-mono text-xs text-text-secondary">
            <p>Grad-CAM target layer: <strong>conv_head</strong>; target: calibrated P(Grade 2–4).</p>
            <p>Handoff limits: roughly 48% mean CAM mass inside the fundus mask, faithfulness 6/15, and an FP32 log-probability cross-check mismatch.</p>
            <p>Lesion detection and vessel segmentation are unavailable.</p>
          </div>
        </div>
      </section>

      {/* 07 — Risk Classification */}
      <section className="py-20 bg-bg-dark border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="07"
            eyebrow="Clinical Triage Categories"
            title="RISK CLASSIFICATION"
            description="Shows the model's five ordinal grade labels. These prototype labels are not clinical triage standards or a confirmed diagnosis."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: 'No DR', risk: 'GRADE 0', color: 'border-status-success text-status-success', desc: 'Lowest ordinal model grade. Clinical confirmation remains required.' },
              { title: 'Mild NPDR', risk: 'GRADE 1', color: 'border-status-warning text-status-warning', desc: 'Mild ordinal model grade. Clinical review remains required.' },
              { title: 'Moderate NPDR', risk: 'GRADE 2', color: 'border-accent-orange text-accent-orange', desc: 'Moderate ordinal model grade. Clinical review remains required.' },
              { title: 'Severe NPDR', risk: 'GRADE 3', color: 'border-accent-crimson text-accent-crimson', desc: 'Severe ordinal model grade. Clinical review remains required.' },
              { title: 'Proliferative DR', risk: 'GRADE 4', color: 'border-accent-crimson text-white bg-accent-crimson/20', desc: 'Highest ordinal model grade. Clinical review remains required.' },
            ].map((cat) => (
              <div key={cat.title} className={`p-5 bg-surface-1 border-2 ${cat.color} space-y-2`}>
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
                  {cat.risk}
                </span>
                <h4 className="font-mono text-sm font-bold uppercase">{cat.title}</h4>
                <p className="text-xs text-text-secondary leading-relaxed font-sans">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 08 — Rural Healthcare Mode */}
      <section id="rural-access" className="py-20 bg-bg-darkest border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            number="08"
            eyebrow="Accessible Engineering"
            title="BUILT FOR THE LAST MILE"
            description="Engineered specifically to support ASHA health workers in low-bandwidth, non-networked rural health camps."
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </section>


      {/* 10 & 11 — Statistics & Trust */}
      <section className="py-20 bg-bg-darkest border-b border-surface-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div>
            <span className="font-mono text-xs uppercase font-bold text-accent-orange px-3 py-1 bg-accent-orange/10 border border-accent-orange">
              10 — Performance Benchmark
            </span>
            <h2 className="text-3xl md:text-5xl font-black font-sans uppercase text-text-primary mt-4">
              Proven Performance Metrics
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 bg-surface-1 border border-surface-border">
              <div className="font-mono text-4xl md:text-5xl font-black text-accent-orange">96.4%</div>
              <div className="font-mono text-xs uppercase text-text-secondary mt-2">Sensitivity</div>
            </div>
            <div className="p-6 bg-surface-1 border border-surface-border">
              <div className="font-mono text-4xl md:text-5xl font-black text-accent-gold">412ms</div>
              <div className="font-mono text-xs uppercase text-text-secondary mt-2">Avg Inference Time</div>
            </div>
            <div className="p-6 bg-surface-1 border border-surface-border">
              <div className="font-mono text-4xl md:text-5xl font-black text-status-success">3,840+</div>
              <div className="font-mono text-xs uppercase text-text-secondary mt-2">Screenings Simulated</div>
            </div>
            <div className="p-6 bg-surface-1 border border-surface-border">
              <div className="font-mono text-4xl md:text-5xl font-black text-accent-crimson">0</div>
              <div className="font-mono text-xs uppercase text-text-secondary mt-2">Black-Box Outputs</div>
            </div>
          </div>
        </div>
      </section>

      {/* 12 — Final CTA Section */}
      <section className="py-24 bg-gradient-to-b from-bg-dark to-bg-darkest relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6 relative z-10">
          <Badge variant="gold">EXPLAINABLE AI CLINICAL THEME</Badge>
          <h2 className="text-4xl sm:text-6xl font-black font-sans uppercase tracking-tight text-text-primary">
            See the Retina. <br />
            Understand the AI.
          </h2>
          <p className="text-base md:text-lg text-text-secondary font-sans max-w-xl mx-auto">
            Experience the Royal Medical AI Command Center designed for rural healthcare accessibility in India.
          </p>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <a href="/screening">
              <Button variant="primary" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                Launch Screening Workstation
              </Button>
            </a>
            <a href="/dashboard">
              <Button variant="brutal" size="lg" icon={<Activity className="w-5 h-5 text-accent-orange" />}>
                View Doctor Dashboard
              </Button>
            </a>
          </div>
        </div>
      </section>

    </PublicLayout>
  );
};
