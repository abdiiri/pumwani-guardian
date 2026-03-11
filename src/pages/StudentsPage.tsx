import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2 } from 'lucide-react';

export default function StudentsPage() {
  const { user } = useAuth();
  const { students, addStudent, updateStudent, deleteStudent } = useData();
  const isAdmin = user?.role === 'admin';
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', studentId: '', class: '', password: '' });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.studentId.toLowerCase().includes(search.toLowerCase()) ||
    s.class.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setEditingId(null);
    setForm({ name: '', email: '', studentId: '', class: '', password: '' });
    setDialogOpen(true);
  };

  const openEdit = (id: string) => {
    const s = students.find(st => st.id === id);
    if (!s) return;
    setEditingId(id);
    setForm({ name: s.name, email: s.email, studentId: s.studentId, class: s.class, password: '' });
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateStudent(editingId, { name: form.name, email: form.email, class: form.class });
    } else {
      addStudent({
        name: form.name,
        email: form.email,
        studentId: form.studentId,
        class: form.class,
        userId: `u${Date.now()}`,
      });
    }
    setDialogOpen(false);
  };

  return (
    <DashboardLayout title="Students" subtitle="Manage student records">
      <div className="flex items-center justify-between mb-6 gap-4">
        <Input
          placeholder="Search by name, ID, or class..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-9"
        />
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={openAdd} className="gap-1.5">
                <Plus className="h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Student' : 'Register Student'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
                </div>
                {!editingId && (
                  <>
                    <div className="space-y-2">
                      <Label>Student ID</Label>
                      <Input value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} required placeholder="e.g. STU009" />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Input value={form.class} onChange={e => setForm(f => ({ ...f, class: e.target.value }))} required placeholder="e.g. Form 1A" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">{editingId ? 'Save Changes' : 'Register'}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="border rounded-md bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Class</th>
                {isAdmin && (
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">No students found.</td></tr>
              ) : (
                filtered.map(student => (
                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3 font-body">{student.studentId}</td>
                    <td className="px-6 py-3 font-medium">{student.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{student.email}</td>
                    <td className="px-6 py-3 text-muted-foreground">{student.class}</td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right">
                        <button onClick={() => openEdit(student.id)} className="p-1.5 text-muted-foreground hover:text-primary transition-colors">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => deleteStudent(student.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors ml-1">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
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
