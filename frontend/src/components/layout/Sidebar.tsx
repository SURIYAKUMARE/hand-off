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

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/admin/tickets', label: 'All tickets', icon: <Ticket className="w-4 h-4" /> },
    { to: '/admin/users', label: 'User management', icon: <Users className="w-4 h-4" /> },
    { to: '/admin/technicians', label: 'Technicians', icon: <UserCheck className="w-4 h-4" /> },
    { to: '/admin/departments', label: 'Departments', icon: <Building2 className="w-4 h-4" /> },
    { to: '/admin/sla', label: 'SLA policies', icon: <Clock className="w-4 h-4" /> },
    { to: '/admin/assets', label: 'IT assets', icon: <Laptop className="w-4 h-4" /> },
    { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/admin/automations', label: 'Automation rules', icon: <Sliders className="w-4 h-4" /> },
    { to: '/admin/reports', label: 'Reports & analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { to: '/admin/audit-logs', label: 'Activity logs', icon: <ShieldCheck className="w-4 h-4" /> },
    { to: '/profile', label: 'Account profile', icon: <UserCircle className="w-4 h-4" /> },
  ];

  const technicianLinks = [
    { to: '/technician/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { to: '/technician/queue', label: 'Support queue', icon: <Inbox className="w-4 h-4" /> },
    {
      to: `/technician/queue?assigneeId=${user?.id || 'me'}`,
      label: 'My assigned tickets',
      icon: <UserCheck className="w-4 h-4" />,
    },
    { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/profile', label: 'My profile', icon: <UserCircle className="w-4 h-4" /> },
  ];

  const employeeLinks = [
    { to: '/employee/tickets', label: 'My tickets', icon: <Ticket className="w-4 h-4" /> },
    { to: '/employee/new-ticket', label: 'New ticket', icon: <PlusCircle className="w-4 h-4" /> },
    { to: '/knowledge-base', label: 'Knowledge base', icon: <BookOpen className="w-4 h-4" /> },
    { to: '/profile', label: 'My profile', icon: <UserCircle className="w-4 h-4" /> },
  ];

  const navLinks =
    user?.role === 'ADMIN'
      ? adminLinks
      : user?.role === 'TECHNICIAN'
      ? technicianLinks
      : employeeLinks;

  return (
    <aside
      className={`h-screen sticky top-0 flex flex-col justify-between bg-surface border-r border-border transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header / Branding */}
      <div className="flex flex-col flex-1 min-h-0">
        <div className="h-14 flex items-center justify-between px-3.5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center flex-shrink-0 font-bold text-xs">
              <LifeBuoy className="w-4 h-4" />
            </div>
            {!isCollapsed && (
              <span className="font-bold text-sm tracking-tight text-text-primary whitespace-nowrap">
                HelpDesk <span className="text-brand">360</span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-text-muted hover:text-text-primary p-1 rounded-md hover:bg-[#F2F4F7] transition-colors"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Section (Scrollable if many items) */}
        <nav className="p-2 space-y-1 overflow-y-auto flex-1 scrollbar-thin" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const navItem = (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/technician/queue' || link.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isCollapsed ? 'justify-center' : ''
                  } ${
                    isActive
                      ? 'bg-brand text-white font-semibold shadow-xs'
                      : 'text-text-secondary hover:bg-[#F2F4F7] hover:text-text-primary'
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

          {/* Component Gallery Link */}
          <div className="pt-2 mt-2 border-t border-border">
            {isCollapsed ? (
              <Tooltip content="Design System" side="right">
                <NavLink
                  to="/design-system"
                  className={({ isActive }) =>
                    `flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive ? 'bg-brand text-white' : 'text-text-muted hover:bg-[#F2F4F7] hover:text-text-primary'
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
                  `flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive ? 'bg-brand text-white' : 'text-text-muted hover:bg-[#F2F4F7] hover:text-text-primary'
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

      {/* Bottom User Profile Section */}
      <div className="p-2 border-t border-border bg-[#FDFDFE] flex-shrink-0">
        <div
          className={`flex items-center gap-2.5 p-1.5 rounded-lg ${
            isCollapsed ? 'justify-center' : 'justify-between'
          }`}
        >
          <div
            className="flex items-center gap-2.5 min-w-0 cursor-pointer"
            onClick={() => navigate('/profile')}
            title="View profile settings"
          >
            <Avatar name={user?.name || 'User'} size="sm" />
            {!isCollapsed && (
              <div className="min-w-0">
                <div className="text-xs font-semibold text-text-primary truncate">
                  {user?.name}
                </div>
                <div className="text-[11px] text-text-muted capitalize truncate">
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
                className="text-text-muted hover:text-[#D92D20] p-1.5 rounded-md hover:bg-[#F2F4F7] transition-colors"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="text-text-muted hover:text-[#D92D20] p-1.5 rounded-md hover:bg-[#F2F4F7] transition-colors flex-shrink-0"
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
