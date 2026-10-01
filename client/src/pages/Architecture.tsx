import React from 'react';
import { PublicLayout } from '../layouts/PublicLayout';
import { SectionHeader } from '../components/common/SectionHeader';
import { ArchitectureDiagram } from '../components/visualization/ArchitectureDiagram';

export const Architecture: React.FC = () => (
  <PublicLayout activePath="/architecture">
    <div className="pt-28 pb-20 bg-bg-darkest min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <SectionHeader
          number="09"
          eyebrow="Implemented screening path"
          title="SYSTEM ARCHITECTURE"
          description="The live workflow uses the React client, FastAPI API, quality gate, frozen E2 ordinal model, calibration, Grad-CAM, and reliability service. Patient storage, lesion detection, vessel segmentation, and offline inference are not connected."
        />
        <ArchitectureDiagram />
      </div>
    </div>
  </PublicLayout>
);
