import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { getAllPatients } from '../services/screeningService';
import type { PatientProfile } from '../types/patient';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Search, ChevronRight, UserPlus, Filter } from 'lucide-react';

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllPatients().then(setPatients).catch(() => setError('Patient service unavailable. No patient records are stored by this prototype.'));
  }, []);

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout activeItem="patients" activePath="/patients">
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-6">
          <div>
            <div className="font-mono text-xs text-accent-gold uppercase font-bold mb-1">
              PATIENT DIRECTORY & RECORDS
            </div>
            <h1 className="text-3xl font-black font-sans uppercase text-text-primary tracking-tight">
              Rural Outreach Patient Database
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search Patient ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 bg-surface-1 border border-surface-border text-xs font-mono text-text-primary focus:outline-none focus:border-accent-orange w-64"
              />
            </div>
          </div>
        </div>

        {error && <p role="status" className="p-4 border border-status-warning/40 text-status-warning font-mono text-xs">{error}</p>}

        {/* Patients Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 font-mono text-xs">
          {filteredPatients.length === 0 && !error && <p className="text-text-muted">No patient records were returned.</p>}
          {filteredPatients.map((patient) => {
            const isHighRisk = patient.riskCategory.includes('Severe') || patient.riskCategory.includes('Moderate') || patient.riskCategory.includes('Referable');

            return (
              <div key={patient.id} className="brutal-card p-6 space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-accent-orange text-sm">{patient.id}</span>
                    <Badge variant={isHighRisk ? 'danger' : 'success'}>
                      {patient.riskCategory}
                    </Badge>
                  </div>

                  <h3 className="text-base font-bold text-text-primary font-sans">
                    {patient.name} ({patient.age}y, {patient.gender})
                  </h3>

                  <div className="text-text-muted text-[11px] space-y-1">
                    <div>Location: {patient.location}</div>
                    <div>Last Screening: {patient.lastScreeningDate}</div>
                    <div>Doctor: {patient.assignedDoctor}</div>
                  </div>
                </div>

                <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted">
                    Conf: <strong className="text-accent-gold">{patient.confidence}%</strong>
                  </span>
                  <a href={`/patients/${patient.id}`}>
                    <Button variant="ghost" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                      View Profile
                    </Button>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </DashboardLayout>
  );
};
