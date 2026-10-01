import React from 'react';
import { Eye, ChevronRight, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import type { PatientProfile } from '../../types/patient';

interface ScreeningTableProps {
  patients: PatientProfile[];
  onSelectPatient?: (id: string) => void;
}

export const ScreeningTable: React.FC<ScreeningTableProps> = ({ patients, onSelectPatient }) => {
  return (
    <div className="brutal-card overflow-hidden">
      <div className="p-4 bg-surface-2 border-b border-surface-border flex items-center justify-between">
        <h3 className="font-mono text-sm uppercase font-bold text-text-primary flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent-orange" />
          Recent Retinal AI Screenings
        </h3>
        <span className="font-mono text-xs text-text-muted">Total: {patients.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse font-mono text-xs">
          <thead>
            <tr className="bg-surface-1 border-b border-surface-border text-text-muted uppercase tracking-wider">
              <th className="p-3">Patient ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Date</th>
              <th className="p-3">Image Quality</th>
              <th className="p-3">Screening Category</th>
              <th className="p-3">Confidence</th>
              <th className="p-3">Review Status</th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {patients.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-text-muted">No screening history is available from the backend.</td></tr>}
            {patients.map((patient) => {
              const isHighRisk = patient.riskCategory.includes('Severe') || patient.riskCategory.includes('Moderate') || patient.riskCategory.includes('Referable');
              
              return (
                <tr key={patient.id} className="hover:bg-surface-2/60 transition-colors">
                  <td className="p-3 font-bold text-accent-orange">{patient.id}</td>
                  <td className="p-3 text-text-primary font-sans font-medium">{patient.name}</td>
                  <td className="p-3 text-text-secondary">{patient.lastScreeningDate}</td>
                  <td className="p-3 text-text-secondary">{patient.imageQuality}</td>
                  <td className="p-3 font-bold text-text-primary">
                    <Badge variant={isHighRisk ? 'danger' : 'success'}>
                      {patient.riskCategory}
                    </Badge>
                  </td>
                  <td className="p-3 font-bold text-accent-gold">{patient.confidence}%</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 border text-[10px] ${
                      patient.reviewStatus === 'Flagged Urgent'
                        ? 'bg-accent-crimson/20 border-accent-crimson text-accent-crimson font-bold animate-pulse'
                        : patient.reviewStatus === 'Verified Normal'
                        ? 'bg-status-success/20 border-status-success text-status-success'
                        : 'bg-surface-3 border-surface-border text-text-secondary'
                    }`}>
                      {patient.reviewStatus}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <a href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                        View Details
                      </Button>
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
