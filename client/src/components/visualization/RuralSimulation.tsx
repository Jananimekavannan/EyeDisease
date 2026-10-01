import React, { useState } from 'react';
import { Sliders, Activity, Clock, Users, ShieldCheck, ArrowRight, FileCode, CheckCircle2 } from 'lucide-react';
import { Button } from '../common/Button';

export const RuralSimulation: React.FC = () => {
  // Model Parameters (Clearly Labeled Assumptions)
  const [patientsPerDay, setPatientsPerDay] = useState<number>(120);
  const [qualityFailureRate, setQualityFailureRate] = useState<number>(10); // %
  const [aiInferenceSec, setAiInferenceSec] = useState<number>(0.42); // sec
  const [manualExamMin, setManualExamMin] = useState<number>(15); // min
  const [humanReviewCapacity, setHumanReviewCapacity] = useState<number>(30); // cases/day/doctor

  // Calculated Queue & Turnaround Metrics
  const qualityRecaptures = Math.round(patientsPerDay * (qualityFailureRate / 100));
  const effectiveScreened = patientsPerDay;

  // Traditional Manual Workflow
  const manualTotalHours = (effectiveScreened * manualExamMin) / 60;
  const manualDaysNeeded = (manualTotalHours / 8).toFixed(1);
  const manualQueueBacklog = Math.max(0, effectiveScreened - 32); // 32 cases max per 8h manual doctor day

  // AI-Assisted Workflow
  const aiScreeningHours = ((effectiveScreened * aiInferenceSec) / 3600).toFixed(3);
  const casesFlaggedForHumanReview = Math.round(effectiveScreened * 0.22); // 22% require review/referral
  const aiQueueBacklog = Math.max(0, casesFlaggedForHumanReview - humanReviewCapacity);
  const aiTurnaroundHours = (parseFloat(aiScreeningHours) + (casesFlaggedForHumanReview / humanReviewCapacity) * 8).toFixed(1);

  const hoursSaved = (manualTotalHours - parseFloat(aiScreeningHours)).toFixed(1);
  const efficiencyMultiplier = (manualTotalHours / (parseFloat(aiScreeningHours) + 0.1)).toFixed(0);

  return (
    <div className="brutal-card p-6 bg-surface-1 border-accent-gold/40 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4 font-mono">
        <div>
          <span className="text-xs text-accent-gold font-bold uppercase block mb-1">
            RURAL OUTREACH CAPACITY EVALUATOR
          </span>
          <h3 className="text-xl font-bold uppercase text-text-primary flex items-center gap-2">
            <Activity className="w-5 h-5 text-accent-orange" />
            Rural Healthcare Screening Capacity Model
          </h3>
        </div>
      </div>

      {/* Assumptions Label Warning */}
      <div className="p-3 bg-surface-2 border border-surface-border text-xs font-mono text-text-secondary flex items-start gap-2">
        <span className="font-bold text-accent-gold uppercase whitespace-nowrap">[CLINICAL CAPACITY NOTE]:</span>
        <span>Interactive parameters model health system throughput and turnaround times for rural outreach clinics.</span>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
        
        {/* Slider 1: Daily Patients */}
        <div className="p-4 bg-surface-2 border border-surface-border space-y-2">
          <div className="flex justify-between text-text-muted">
            <span>DAILY PATIENT FOOTFALL:</span>
            <span className="font-bold text-accent-orange">{patientsPerDay} / day</span>
          </div>
          <input
            type="range"
            min="30"
            max="300"
            value={patientsPerDay}
            onChange={(e) => setPatientsPerDay(parseInt(e.target.value))}
            className="w-full accent-accent-orange cursor-pointer"
          />
        </div>

        {/* Slider 2: Quality Failure Rate */}
        <div className="p-4 bg-surface-2 border border-surface-border space-y-2">
          <div className="flex justify-between text-text-muted">
            <span>IMAGE RECAPTURE RATE:</span>
            <span className="font-bold text-status-warning">{qualityFailureRate}%</span>
          </div>
          <input
            type="range"
            min="2"
            max="30"
            value={qualityFailureRate}
            onChange={(e) => setQualityFailureRate(parseInt(e.target.value))}
            className="w-full accent-status-warning cursor-pointer"
          />
        </div>

        {/* Slider 3: Doctor Daily Capacity */}
        <div className="p-4 bg-surface-2 border border-surface-border space-y-2">
          <div className="flex justify-between text-text-muted">
            <span>TELE-DOCTOR DAILY CAPACITY:</span>
            <span className="font-bold text-accent-gold">{humanReviewCapacity} cases/day</span>
          </div>
          <input
            type="range"
            min="10"
            max="80"
            value={humanReviewCapacity}
            onChange={(e) => setHumanReviewCapacity(parseInt(e.target.value))}
            className="w-full accent-accent-gold cursor-pointer"
          />
        </div>

      </div>

      {/* Comparison Results Table */}
      <div className="space-y-4">
        <h4 className="font-mono text-xs uppercase font-bold text-text-primary tracking-wider">
          WORKFLOW PERFORMANCE COMPARISON OUTPUT
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          
          {/* Manual Workflow Card */}
          <div className="p-5 bg-surface-2 border-2 border-accent-crimson space-y-3">
            <div className="flex justify-between items-center border-b border-surface-border pb-2">
              <span className="font-bold text-accent-crimson uppercase">TRADITIONAL MANUAL WORKFLOW</span>
              <span className="text-[10px] text-text-muted">100% Specialist Exam</span>
            </div>

            <div className="space-y-2 text-text-secondary">
              <div className="flex justify-between">
                <span>Specialist Time Required:</span>
                <strong className="text-text-primary">{manualTotalHours.toFixed(1)} hours</strong>
              </div>
              <div className="flex justify-between">
                <span>Patient Queue Backlog:</span>
                <strong className="text-status-danger">{manualQueueBacklog} patients waiting</strong>
              </div>
              <div className="flex justify-between">
                <span>Avg Turnaround Delay:</span>
                <strong className="text-status-danger">{manualDaysNeeded} days</strong>
              </div>
            </div>
          </div>

          {/* AI-Assisted Workflow Card */}
          <div className="p-5 bg-surface-2 border-2 border-status-success space-y-3">
            <div className="flex justify-between items-center border-b border-surface-border pb-2">
              <span className="font-bold text-status-success uppercase">AI-ASSISTED TRIAGE WORKFLOW</span>
              <span className="text-[10px] text-status-success font-bold">{efficiencyMultiplier}x FASTER</span>
            </div>

            <div className="space-y-2 text-text-secondary">
              <div className="flex justify-between">
                <span>AI Screening Time:</span>
                <strong className="text-accent-orange">{aiScreeningHours} hours ({aiInferenceSec}s/patient)</strong>
              </div>
              <div className="flex justify-between">
                <span>Specialist Review Cases:</span>
                <strong className="text-accent-gold">{casesFlaggedForHumanReview} cases (22% triaged)</strong>
              </div>
              <div className="flex justify-between">
                <span>Avg Turnaround Time:</span>
                <strong className="text-status-success">{aiTurnaroundHours} hours</strong>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Impact Summary Banner */}
      <div className="p-4 bg-surface-2 border border-accent-orange flex items-center gap-3 font-mono text-xs">
        <CheckCircle2 className="w-5 h-5 text-status-success flex-shrink-0" />
        <span>
          <strong className="text-accent-orange font-bold">{hoursSaved} HOURS</strong> of specialist doctor time saved per day for <strong>{patientsPerDay} patients</strong>.
        </span>
      </div>

    </div>
  );
};
