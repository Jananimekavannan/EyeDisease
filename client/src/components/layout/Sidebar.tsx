import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Eye, 
  FileText, 
  CalendarClock, 
  Send, 
  BarChart3, 
  Settings,
  Shield,
  Activity
} from 'lucide-react';

interface SidebarProps {
  activeItem?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeItem = 'dashboard' }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, href: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: <Users className="w-4 h-4" />, href: '/patients' },
    { id: 'screening', label: 'Screening', icon: <Eye className="w-4 h-4" />, href: '/screening' },
    { id: 'reports', label: 'Reports', icon: <FileText className="w-4 h-4" />, href: '/reports' },
    { id: 'explainability', label: 'XAI Heatmaps', icon: <Activity className="w-4 h-4" />, href: '/explainability' },
    { id: 'architecture', label: 'System Spec', icon: <Shield className="w-4 h-4" />, href: '/architecture' },
    { id: 'about', label: 'About Platform', icon: <BarChart3 className="w-4 h-4" />, href: '/about' },
  ];

  return (
    <aside className="w-64 bg-surface-1 border-r border-surface-border min-h-[calc(100vh-4rem)] p-4 space-y-6 hidden lg:block flex-shrink-0">
      <div className="px-2 py-1 bg-surface-2 border border-accent-orange/40 font-mono text-[11px] text-accent-gold flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-accent-orange animate-pulse" />
        CLINICAL COMMAND CENTER
      </div>

      <nav className="space-y-1 font-mono text-xs">
        {navItems.map((item) => {
          const isActive = activeItem === item.id;
          return (
            <a
              key={item.id}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 uppercase font-bold transition-all border ${
                isActive
                  ? 'bg-accent-orange/15 text-accent-orange border-accent-orange shadow-brutal-dark'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-surface-2'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          );
        })}
      </nav>

      {/* Offline Sync Mode Card */}
      <div className="p-3 bg-surface-2 border border-surface-border text-xs font-mono space-y-2">
        <div className="flex items-center justify-between text-[10px] text-text-muted">
          <span>RURAL OUTREACH UNIT</span>
          <span className="text-status-success font-bold">ONLINE</span>
        </div>
        <div className="text-text-primary font-bold text-[11px]">
          Camp ID: CG-RAIGARH-04
        </div>
        <p className="text-[10px] text-text-secondary">
          Sync Buffer: 0 pending images. Local ONNX Inference Active.
        </p>
      </div>
    </aside>
  );
};
