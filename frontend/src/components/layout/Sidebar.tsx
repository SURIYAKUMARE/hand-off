import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../common/Avatar';
import { Tooltip } from '../common/Tooltip';
import {
  LifeBuoy,
  Ticket,
  PlusCircle,
  LayoutDashboard,
  Inbox,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Palette,
  Users,
  Building2,
  Clock,
  BookOpen,
  Laptop,
  Sliders,
  BarChart3,
  ShieldCheck,
  UserCircle,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminSections = [
    {
      title: 'OPERATIONS',
      links: [
        { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/admin/tickets', label: 'All tickets', icon: <Ticket className="w-4 h-4" /> },
      ],
    },
    {
      title: 'ADMINISTRATION',
      links: [
        { to: '/admin/users', label: 'User directory', icon: <Users className="w-4 h-4" /> },
        { to: '/admin/technicians', label: 'Technicians', icon: <UserCheck className="w-4 h-4" /> },
        { to: '/admin/departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
        { to: '/admin/sla', label: 'SLA policies', icon: <Clock className="w-4 h-4" /> },
        { to: '/admin/assets', label: 'IT assets', icon: <Laptop className="w-4 h-4" /> },
      ],
    },
    {
      title: 'INTELLIGENCE',
      links: [
        { to: '/admin/automations', label: 'Automations', icon: <Sliders className="w-4 h-4" /> },
        { to: '/admin/reports', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        { to: '/admin/audit-logs', label: 'Audit logs', icon: <ShieldCheck className="w-4 h-4" /> },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
        { to: '/profile', label: 'Account profile', icon: <UserCircle className="w-4 h-4" /> },
      ],
    },
  ];

  const technicianSections = [
    {
      title: 'WORKSPACE',
      links: [
        { to: '/technician/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
        { to: '/technician/queue', label: 'Support queue', icon: <Inbox className="w-4 h-4" /> },
        {
          to: `/technician/queue?assigneeId=${user?.id || 'me'}`,
          label: 'My assigned tickets',
          icon: <UserCheck className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'RESOURCES',
      links: [
        { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
        { to: '/profile', label: 'My profile', icon: <UserCircle className="w-4 h-4" /> },
      ],
    },
  ];

  const employeeSections = [
    {
      title: 'MY DESK',
      links: [
        { to: '/employee/tickets', label: 'My tickets', icon: <Ticket className="w-4 h-4" /> },
        { to: '/employee/new-ticket', label: 'New ticket', icon: <PlusCircle className="w-4 h-4" /> },
      ],
    },
    {
      title: 'HELP & RESOURCES',
      links: [
        { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
        { to: '/profile', label: 'My profile', icon: <UserCircle className="w-4 h-4" /> },
      ],
    },
  ];

  const navSections =
    user?.role === 'ADMIN'
      ? adminSections
      : user?.role === 'TECHNICIAN'
      ? technicianSections
      : employeeSections;

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col justify-between bg-sidebar-bg border-r border-sidebar-border transition-all duration-200 z-40 select-none shadow-xs ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header / Branding with Niyam AI emblem styling */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-sidebar-border flex-shrink-0 bg-surface">
          <div
            className="flex items-center gap-2.5 overflow-hidden cursor-pointer"
            onClick={() => {
              if (user?.role === 'ADMIN') navigate('/admin/dashboard');
              else if (user?.role === 'TECHNICIAN') navigate('/technician/dashboard');
              else navigate('/employee/tickets');
            }}
          >
            {/* Squircle Brand Emblem with Pulsing Live Dot */}
            <div className="relative w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center flex-shrink-0 shadow-xs">
              <LifeBuoy className="w-4 h-4 text-brand" />
              <span className="live-indicator-dot absolute -top-1 -right-1" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-[13px] tracking-tight text-text-primary whitespace-nowrap">
                    HelpDesk <span className="text-brand">360</span>
                  </span>
                  <span className="brand-tag">v2.4</span>
                </div>
                <span className="text-[10px] text-text-muted font-medium truncate uppercase tracking-wider">
                  ITSM Operations
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-muted transition-colors cursor-pointer border border-transparent hover:border-border"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Sections */}
        <nav
          className="p-2 space-y-3 overflow-y-auto flex-1 scrollbar-thin"
          aria-label="Main Navigation"
        >
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-0.5">
              {!isCollapsed && (
                <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-extrabold tracking-wider text-text-muted uppercase">
                  {section.title}
                </div>
              )}
              {section.links.map((link) => {
                const navItem = (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/technician/queue' || link.to === '/admin/dashboard'}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isCollapsed ? 'justify-center' : ''
                      } ${
                        isActive
                          ? 'bg-brand/10 dark:bg-brand/20 text-brand border-l-[3px] border-brand shadow-xs font-bold'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary border-l-[3px] border-transparent'
                      }`
                    }
                  >
                    <span className="flex-shrink-0">{link.icon}</span>
                    {!isCollapsed && <span className="truncate">{link.label}</span>}
                  </NavLink>
                );

                return isCollapsed ? (
                  <Tooltip key={link.to} content={link.label} side="right">
                    {navItem}
                  </Tooltip>
                ) : (
                  navItem
                );
              })}
            </div>
          ))}

          {/* Design System Reference Link */}
          <div className="pt-2 mt-2 border-t border-border">
            {isCollapsed ? (
              <Tooltip content="Design System Gallery" side="right">
                <NavLink
                  to="/design-system"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'bg-brand/10 text-brand' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'
                    }`
                  }
                >
                  <Palette className="w-4 h-4" />
                </NavLink>
              </Tooltip>
            ) : (
              <NavLink
                to="/design-system"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive ? 'bg-brand/10 text-brand' : 'text-text-muted hover:bg-surface-hover hover:text-text-primary'
                  }`
                }
              >
                <Palette className="w-4 h-4" />
                <span>Design system</span>
              </NavLink>
            )}
          </div>
        </nav>
      </div>

      {/* Footer Area: SLA Assurance Card & User Profile Card */}
      <div className="p-2 border-t border-sidebar-border bg-surface-muted flex-shrink-0 space-y-2">
        {/* Statutory / Compliance Card (Hidden when collapsed) */}
        {!isCollapsed && (
          <div className="p-2.5 rounded-lg bg-surface border border-border shadow-xs text-left">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-text-primary">
              <ShieldCheck className="w-3.5 h-3.5 text-brand flex-shrink-0" />
              <span>SLA Assurance</span>
            </div>
            <p className="text-[10px] text-text-muted mt-0.5 leading-snug">
              ISO 20000 ITIL compliant service desk with verified immutable audit log.
            </p>
          </div>
        )}

        {/* User Profile Card */}
        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-lg bg-surface border border-border shadow-xs ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            className="flex items-center gap-2 min-w-0 cursor-pointer"
            onClick={() => navigate('/profile')}
            title="View account profile"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-bold text-text-primary truncate">
                  {user?.name}
                </div>
                <div className="text-[10px] text-text-muted font-medium truncate">
                  {user?.role === 'ADMIN'
                    ? 'Administrator'
                    : user?.role === 'TECHNICIAN'
                    ? 'IT Technician'
                    : 'Employee'}
                </div>
              </div>
            )}
          </div>

          {isCollapsed ? (
            <Tooltip content="Sign out" side="right">
              <button
                type="button"
                onClick={handleLogout}
                className="text-text-muted hover:text-rose-600 p-1.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="text-text-muted hover:text-rose-600 p-1.5 rounded-lg hover:bg-surface-hover transition-colors flex-shrink-0 cursor-pointer"
              title="Sign out"
              aria-label="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
