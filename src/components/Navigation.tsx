'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  PieChart, 
  Briefcase, 
  Users, 
  BookOpen, 
  Presentation, 
  FileText, 
  Menu,
  X,
  Settings,
  LineChart
} from 'lucide-react';

const navItems = [
  { name: 'Executive Dashboard', href: '/reports', icon: PieChart },
  { name: 'โครงการวิจัย', href: '/projects', icon: Briefcase },
  { name: 'นักวิจัย', href: '/researchers', icon: Users },
  { name: 'บทความและผลงาน', href: '/publications', icon: BookOpen },
  { name: 'Citation & H-Index', href: 'https://medicine-citation-h-index.pages.dev/', icon: LineChart, external: true },
  { name: 'นำเสนอผลงาน', href: '/presentations', icon: Presentation },
  { name: 'iRAM Experience', href: 'https://iram-experience.pages.dev/public/', icon: FileText, external: true },
];

export default function Navigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f4f6] overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white transition-all duration-300">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg">
            i
          </div>
          <span className="text-xl font-extrabold tracking-tight">iRAM Platform</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = !item.external && pathname.startsWith(item.href);
            
            const className = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive 
                ? 'bg-emerald-500/10 text-emerald-400 font-medium' 
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`;
            
            const content = (
              <>
                <Icon size={20} className={`${isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                {item.name}
              </>
            );

            return item.external ? (
              <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                {content}
              </a>
            ) : (
              <Link key={item.name} href={item.href} className={className}>
                {content}
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t border-slate-800">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200 group">
            <Settings size={20} className="text-slate-500 group-hover:text-slate-300" />
            Admin Settings
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 z-20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-sm">
              i
            </div>
            <span className="text-lg font-bold text-slate-800">iRAM</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </header>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-16 inset-x-0 bg-white border-b border-slate-200 shadow-xl z-10 px-4 py-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = !item.external && pathname.startsWith(item.href);
              
              const className = `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-emerald-50 text-emerald-600 font-bold' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`;

              const content = (
                <>
                  <Icon size={20} className={`${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                  {item.name}
                </>
              );

              return item.external ? (
                <a key={item.name} href={item.href} target="_blank" rel="noopener noreferrer" onClick={() => setIsMobileMenuOpen(false)} className={className}>
                  {content}
                </a>
              ) : (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={className}>
                  {content}
                </Link>
              );
            })}
            <div className="border-t border-slate-100 mt-2 pt-2">
              <Link 
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-50 transition-all duration-200"
              >
                <Settings size={20} className="text-slate-400" />
                Admin Settings
              </Link>
            </div>
          </div>
        )}

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
