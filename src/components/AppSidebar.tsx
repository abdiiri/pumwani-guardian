import { useAuth } from '@/contexts/AuthContext';
import { NavLink } from '@/components/NavLink';
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  DollarSign,
  BarChart3,
  UserCircle,
  LogOut,
  Shield,
  GraduationCap,
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/users', label: 'Users & Roles', icon: Shield },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/fees', label: 'Fees', icon: DollarSign },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const managerLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
  { to: '/attendance', label: 'Attendance', icon: ClipboardCheck },
  { to: '/fees', label: 'Fees', icon: DollarSign },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

const studentLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/profile', label: 'Profile', icon: UserCircle },
];

export function AppSidebar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : user.role === 'manager' ? managerLinks : studentLinks;

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-sm font-bold tracking-tight text-sidebar-foreground">
              Pumwani Boys
            </h1>
            <p className="text-[11px] text-sidebar-muted font-body">
              Record Management
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-muted">
          Menu
        </p>
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-muted transition-all duration-150 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <link.icon className="h-4 w-4 flex-shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-xs font-bold text-sidebar-primary">
              {user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-[11px] text-sidebar-muted capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-sidebar-muted hover:text-destructive transition-colors w-full px-1"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
