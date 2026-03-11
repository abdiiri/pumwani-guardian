import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface UserWithRole {
  id: string;
  name: string;
  email: string;
  currentRole: string | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);

    // Fetch all profiles (admin can see all via RLS)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, name, email');

    // Fetch all roles
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (profiles) {
      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);
      setUsers(profiles.map(p => ({
        id: p.id,
        name: p.name,
        email: p.email,
        currentRole: roleMap.get(p.id) || null,
      })));
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setSaving(userId);
    const user = users.find(u => u.id === userId);

    if (user?.currentRole) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) {
        toast.error('Failed to update role: ' + error.message);
        setSaving(null);
        return;
      }
    } else {
      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: newRole });

      if (error) {
        toast.error('Failed to assign role: ' + error.message);
        setSaving(null);
        return;
      }
    }

    toast.success(`Role updated to ${newRole}`);
    await fetchUsers();
    setSaving(null);
  };

  return (
    <DashboardLayout title="Users & Roles" subtitle="Manage user accounts and role assignments">
      <div className="border rounded-md bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Current Role</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3 font-medium">{user.name || '—'}</td>
                    <td className="px-6 py-3 text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-3">
                      {user.currentRole ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary capitalize">
                          {user.currentRole}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">No role</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <Select
                          value={user.currentRole || ''}
                          onValueChange={(value) => handleRoleChange(user.id, value)}
                          disabled={saving === user.id}
                        >
                          <SelectTrigger className="w-32 h-8 text-xs">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                          </SelectContent>
                        </Select>
                        {saving === user.id && <span className="text-xs text-muted-foreground">Saving...</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
