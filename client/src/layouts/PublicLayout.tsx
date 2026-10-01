import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

interface PublicLayoutProps {
  children: React.ReactNode;
  activePath?: string;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children, activePath = '/' }) => {
  return (
    <div className="min-h-screen bg-bg-darkest text-text-primary flex flex-col font-sans selection:bg-accent-orange selection:text-bg-darkest">
      <Navbar activePath={activePath} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};
