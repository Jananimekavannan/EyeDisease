import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { Home } from '../pages/Home';
import { Screening } from '../pages/Screening';
import { Explainability } from '../pages/Explainability';
import { Dashboard } from '../pages/Dashboard';
import { Patients } from '../pages/Patients';
import { PatientDetails } from '../pages/PatientDetails';
import { Reports } from '../pages/Reports';
import { Architecture } from '../pages/Architecture';
import { About } from '../pages/About';
import { RuralAccess } from '../pages/RuralAccess';
import { NotFound } from '../pages/NotFound';

const PatientDetailsWrapper = () => {
  const { id } = useParams<{ id: string }>();
  return <PatientDetails id={id} />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/screening" element={<Screening />} />
      <Route path="/explainability" element={<Explainability />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/patients" element={<Patients />} />
      <Route path="/patients/:id" element={<PatientDetailsWrapper />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/rural-access" element={<RuralAccess />} />
      <Route path="/about" element={<About />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
