import React from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { FileText } from 'lucide-react';

export const Reports: React.FC = () => (
  <DashboardLayout activeItem="reports" activePath="/reports">
    <section className="brutal-card max-w-3xl mx-auto p-8 space-y-4">
      <FileText className="w-8 h-8 text-accent-orange" />
      <h1 className="text-2xl font-black uppercase">Screening reports unavailable</h1>
      <p className="text-sm text-text-secondary">
        This project has no connected patient or report storage service. Screening results are shown directly after an upload and are not saved as patient records.
      </p>
      <p className="font-mono text-xs text-status-warning">
        Patient details, lesion counts, and historical report values are not available.
      </p>
    </section>
  </DashboardLayout>
);
