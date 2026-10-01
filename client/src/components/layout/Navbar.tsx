import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Button } from '../common/Button';

interface NavbarProps {
  activePath?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ activePath = '/' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Screening', href: '/screening' },
    { label: 'Explainability', href: '/explainability' },
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Rural Access', href: '/rural-access' },
    { label: 'About', href: '/about' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? 'py-2 bg-bg-darkest/90 backdrop-blur-md border-b border-accent-orange/30 shadow-royal'
          : 'py-4 bg-transparent border-b border-surface-border/50'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 bg-white border border-accent-orange flex items-center justify-center shadow-brutal rounded overflow-hidden group-hover:scale-105 transition-transform flex-shrink-0">
              <img 
                src="/logo.png" 
                alt="Retina-X Logo" 
                className="w-full h-full object-contain p-0.5" 
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-mono font-black text-lg text-text-primary tracking-wider uppercase">
                RETINA<span className="text-accent-orange">-X</span>
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 bg-surface-1/80 border border-surface-border px-3 py-1.5 backdrop-blur-sm">
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-3 py-1 text-xs font-mono font-semibold uppercase tracking-wider transition-all duration-150 relative ${
                    isActive
                      ? 'text-accent-orange font-bold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-2'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-accent-orange shadow-[0_0_8px_#FF5A1F]" />
                  )}
                </a>
              );
            })}
          </nav>

          {/* Right Action */}
          <div className="hidden lg:flex items-center gap-3">
            <a href="/screening">
              <Button variant="primary" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>
                Launch Screening
              </Button>
            </a>
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-text-secondary hover:text-text-primary bg-surface-1 border border-surface-border"
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-accent-orange" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-surface-1 border-b border-accent-orange/40 px-4 py-6 space-y-4 animate-fade-in">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="px-4 py-2 text-sm font-mono uppercase font-bold text-text-primary hover:text-accent-orange hover:bg-surface-2 border-l-2 border-transparent hover:border-accent-orange"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="pt-4 border-t border-surface-border">
            <a href="/screening" className="block w-full">
              <Button variant="primary" size="md" className="w-full" icon={<ArrowRight className="w-4 h-4" />}>
                Launch Screening
              </Button>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
