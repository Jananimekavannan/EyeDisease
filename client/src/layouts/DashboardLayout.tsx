import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { Footer } from '../components/layout/Footer';

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeItem?: string;
  activePath?: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  activeItem = 'dashboard',
  activePath = '/dashboard',
}) => {
  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary flex flex-col font-sans">
      <Navbar activePath={activePath} />
      <div className="pt-20 flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <Sidebar activeItem={activeItem} />
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">{children}</main>
      </div>
      <Footer />
    </div>
  );
};
