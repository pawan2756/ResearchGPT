import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Clock,
  CheckSquare,
  BarChart2,
  Settings,
  Sun,
  Moon,
  Laptop,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Tag } from '../ui/Tag.jsx';
import { apiGetHealth } from '../../api/auth.js';

export function Sidebar() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    async function checkHealth() {
      try {
        const data = await apiGetHealth();
        if (data?.isMockMode || data?.mode === 'mock') {
          setIsMockMode(true);
        }
      } catch {
        // Ignored in offline/mock environment
      }
    }
    checkHealth();
  }, []);

  const navItems = [
    { to: '/chat', label: 'Chat', icon: MessageSquare },
    { to: '/history', label: 'History', icon: Clock },
    { to: '/evaluation', label: 'Evaluation', icon: CheckSquare },
    { to: '/analytics', label: 'Analytics', icon: BarChart2 },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  const cycleTheme = () => {
    if (theme === 'system') setTheme('light');
    else if (theme === 'light') setTheme('dark');
    else setTheme('system');
  };

  const themeIcon = {
    system: <Laptop className="w-4 h-4" />,
    light: <Sun className="w-4 h-4" />,
    dark: <Moon className="w-4 h-4" />,
  }[theme];

  return (
    <>
      {/* Mobile Top Bar (< 768px) */}
      <header
        className="md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-40"
        style={{
          backgroundColor: 'var(--nav-bg)',
          color: 'var(--nav-text)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" style={{ color: 'var(--primary)' }} />
          <span className="font-semibold text-[17px] text-white">ResearchGPT</span>
          {isMockMode && (
            <Tag variant="warning" size="xs">
              Mock mode
            </Tag>
          )}
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded focus-ring text-white hover:bg-[var(--nav-hover)] transition-colors"
          aria-label="Toggle Navigation"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar (Desktop 220px fixed, Mobile drawer) */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen z-50 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } w-[220px] select-none`}
        style={{
          backgroundColor: 'var(--nav-bg)',
          color: 'var(--nav-text)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-[var(--nav-hover)]">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--primary)' }} />
            <h1 className="text-[17px] font-semibold text-white tracking-tight">ResearchGPT</h1>
          </div>
          <p className="text-[11px] leading-tight text-[var(--nav-text)] opacity-80">
            Ask first, research on consent
          </p>
          {isMockMode && (
            <div className="mt-2.5">
              <Tag variant="warning" size="xs" className="w-full justify-center">
                Mock mode
              </Tag>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-[8px] text-[14px] font-medium transition-colors ${
                    isActive
                      ? 'bg-[var(--nav-hover)] text-white font-semibold'
                      : 'text-[var(--nav-text)] hover:bg-[var(--nav-hover)] hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Profile & Theme Controls */}
        <div className="p-3 border-t border-[var(--nav-hover)] space-y-2">
          <div className="flex items-center pt-1">
            <button
              onClick={cycleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] text-[12px] hover:bg-[var(--nav-hover)] text-[var(--nav-text)] hover:text-white transition-colors"
              title={`Current theme: ${theme}. Click to change.`}
            >
              {themeIcon}
              <span className="capitalize">{theme}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
