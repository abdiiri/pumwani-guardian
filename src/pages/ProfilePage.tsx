import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const fields = [
    { label: 'Full Name', value: user.name },
    { label: 'Email', value: user.email },
    { label: 'Role', value: user.role.charAt(0).toUpperCase() + user.role.slice(1) },
    ...(user.studentId ? [{ label: 'Student ID', value: user.studentId }] : []),
    ...(user.class ? [{ label: 'Class', value: user.class }] : []),
  ];

  return (
    <DashboardLayout title="Profile" subtitle="Your account information">
      <div className="border rounded-md bg-card max-w-lg">
        <div className="divide-y">
          {fields.map(field => (
            <div key={field.label} className="flex items-center justify-between px-6 py-4">
              <span className="text-sm text-muted-foreground">{field.label}</span>
              <span className="text-sm font-medium text-foreground">{field.value}</span>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
