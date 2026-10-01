import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { getPatientById } from '../services/screeningService';
import type { PatientProfile } from '../types/patient';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ArrowLeft, Calendar, User, MapPin, Eye, FileText, Stethoscope, Sparkles } from 'lucide-react';

interface PatientDetailsProps {
  id?: string;
}

export const PatientDetails: React.FC<PatientDetailsProps> = ({ id }) => {
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) {
      setError(true);
      return;
    }
    getPatientById(id).then(setPatient).catch(() => setError(true));
  }, [id]);

  if (!patient || error) {
    return (
      <DashboardLayout activeItem="patients" activePath="/patients">
        <div className="p-12 text-center font-mono text-text-muted">
          {error ? 'Patient record unavailable. No patient storage service is connected.' : 'Loading patient record…'}
        </div>
      </DashboardLayout>
    );
  }

  const isHighRisk = patient.riskCategory.includes('Severe') || patient.riskCategory.includes('Moderate');

  return (
    <DashboardLayout activeItem="patients" activePath="/patients">
      <div className="space-y-8">
        
        {/* Back Link */}
        <div>
          <a href="/patients" className="inline-flex items-center gap-1 font-mono text-xs text-text-muted hover:text-accent-orange">
            <ArrowLeft className="w-4 h-4" /> Back to Patient Directory
          </a>
        </div>

        {/* Patient Profile Header Card */}
        <div className="brutal-card p-6 border-l-4 border-l-accent-orange space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="font-mono text-xl font-bold text-accent-orange">{patient.id}</span>
                <Badge variant={isHighRisk ? 'danger' : 'success'}>{patient.riskCategory}</Badge>
                <span className="text-xs font-mono text-text-muted">Status: {patient.reviewStatus}</span>
              </div>
              <h1 className="text-3xl font-black font-sans uppercase text-text-primary">
                {patient.name}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <a href="/reports">
                <Button variant="secondary" size="sm" icon={<FileText className="w-4 h-4" />}>
                  Export Clinical Report
                </Button>
              </a>
              <a href="/screening">
                <Button variant="primary" size="sm" icon={<Eye className="w-4 h-4" />}>
                  New Retinal Scan
                </Button>
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-surface-border font-mono text-xs text-text-secondary">
            <div>
              <span className="text-text-muted block text-[10px] uppercase">AGE & GENDER</span>
              <strong className="text-text-primary">{patient.age} years • {patient.gender}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">RURAL LOCATION</span>
              <strong className="text-text-primary">{patient.location}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">PRIMARY PHONE</span>
              <strong className="text-text-primary">{patient.primaryPhone}</strong>
            </div>
            <div>
              <span className="text-text-muted block text-[10px] uppercase">ASSIGNED CLINICIAN</span>
              <strong className="text-accent-gold">{patient.assignedDoctor}</strong>
            </div>
          </div>
        </div>

        {/* Screening History Timeline */}
        <div className="space-y-4">
          <h3 className="font-mono text-sm font-bold uppercase text-text-primary tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-accent-orange" />
            Screening Longitudinal History ({patient.screenings.length} records)
          </h3>

          <div className="space-y-4 font-mono text-xs">
            {patient.screenings.map((scr) => (
              <div key={scr.id} className="brutal-card p-6 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-surface-border">
                  <span className="font-bold text-accent-orange text-sm">{scr.id} • {scr.eye}</span>
                  <span className="text-text-muted">{scr.date}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">GRADE / DIAGNOSIS</span>
                    <strong className="text-text-primary text-sm">{scr.grade}</strong>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">AI CONFIDENCE</span>
                    <strong className="text-accent-gold text-sm">{scr.confidence}%</strong>
                  </div>
                  <div>
                    <span className="text-text-muted text-[10px] uppercase block">ATTENTION REGION</span>
                    <strong className="text-accent-bright">{scr.attentionRegion}</strong>
                  </div>
                </div>

                <div className="p-3 bg-surface-2 border border-surface-border font-sans text-xs text-text-secondary">
                  <strong className="font-mono text-accent-gold uppercase text-[10px] block mb-0.5">CLINICAL RECOMMENDATION:</strong>
                  {scr.recommendation}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};
