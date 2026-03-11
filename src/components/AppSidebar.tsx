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
} from 'lucide-react';

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/students', label: 'Students', icon: Users },
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
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 border-r bg-card flex flex-col">
      {/* Header */}
      <div className="px-6 py-6 border-b">
        <h1 className="font-heading text-base font-bold tracking-tight text-foreground">
          Pumwani Boys
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5 font-body">
          Record Management
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/dashboard'}
            className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            activeClassName="bg-sidebar-accent text-sidebar-accent-foreground"
          >
            <link.icon className="h-4 w-4 flex-shrink-0" />
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="border-t px-4 py-4">
        <div className="mb-3">
          <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-destructive transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
