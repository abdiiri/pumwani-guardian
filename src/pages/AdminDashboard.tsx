import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { Users, UserCheck, UserX, DollarSign, Megaphone, Plus, Trash2, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import * as XLSX from 'xlsx';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { students, attendance, fees, announcements, refresh } = useData();
  const today = new Date().toISOString().split('T')[0];

  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);

  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;

  const feesPaid = fees.filter(f => f.paymentStatus === 'paid').length;
  const feesPartial = fees.filter(f => f.paymentStatus === 'partial').length;
  const feesPending = fees.filter(f => f.paymentStatus === 'pending').length;

  const totalCollected = fees.reduce((sum, f) => sum + f.amountPaid, 0);
  const totalExpected = fees.reduce((sum, f) => sum + f.totalAmount, 0);
  const collectionRate = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const attendancePie = [
    { name: 'Present', value: presentToday, color: 'hsl(160 84% 39%)' },
    { name: 'Absent', value: absentToday, color: 'hsl(0 72% 51%)' },
    { name: 'Unmarked', value: Math.max(0, students.length - presentToday - absentToday), color: 'hsl(220 13% 91%)' },
  ].filter(d => d.value > 0);

  const feePie = [
    { name: 'Paid', value: feesPaid, color: 'hsl(160 84% 39%)' },
    { name: 'Partial', value: feesPartial, color: 'hsl(38 92% 50%)' },
    { name: 'Pending', value: feesPending, color: 'hsl(0 72% 51%)' },
  ].filter(d => d.value > 0);

  const classCounts = students.reduce<Record<string, number>>((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {});
  const classBarData = Object.entries(classCounts).map(([cls, count]) => ({ class: cls, students: count }));

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from('announcements').insert({
      title: announcementForm.title,
      content: announcementForm.content,
      created_by: user.id,
    } as any);
    if (error) {
      toast.error('Failed to create announcement');
    } else {
      toast.success('Announcement posted');
      setAnnouncementForm({ title: '', content: '' });
      setAnnouncementOpen(false);
      await refresh();
    }
    setSubmitting(false);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    await supabase.from('announcements').delete().eq('id', id);
    toast.success('Announcement deleted');
    await refresh();
  };

  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    const studentsSheet = XLSX.utils.json_to_sheet(
      students.map(s => ({
        'Student ID': s.studentId,
        'Name': s.name,
        'Username': s.email.split('@')[0],
        'Class': s.class,
      }))
    );
    XLSX.utils.book_append_sheet(wb, studentsSheet, 'Students');

    const attendanceSheet = XLSX.utils.json_to_sheet(
      attendance.map(a => {
        const st = students.find(s => s.studentId === a.studentId);
        return {
          'Date': a.date,
          'Student ID': a.studentId,
          'Name': st?.name || '',
          'Class': st?.class || '',
          'Status': a.status,
        };
      })
    );
    XLSX.utils.book_append_sheet(wb, attendanceSheet, 'Attendance');

    const feesSheet = XLSX.utils.json_to_sheet(
      fees.map(f => {
        const st = students.find(s => s.studentId === f.studentId);
        return {
          'Student ID': f.studentId,
          'Name': st?.name || '',
          'Class': st?.class || '',
          'Total (KES)': f.totalAmount,
          'Paid (KES)': f.amountPaid,
          'Balance (KES)': f.totalAmount - f.amountPaid,
          'Status': f.paymentStatus,
          'Last Payment': f.date,
        };
      })
    );
    XLSX.utils.book_append_sheet(wb, feesSheet, 'Fees');

    const stamp = new Date().toISOString().split('T')[0];
    XLSX.writeFile(wb, `pumwani-records-${stamp}.xlsx`);
    toast.success('Excel file downloaded');
  };

  return (
    <DashboardLayout title="Dashboard" subtitle="Today's overview">
      <div className="flex justify-end mb-4">
        <Button onClick={handleExportExcel} size="sm" variant="outline" className="gap-1.5">
          <Download className="h-4 w-4" /> Download Excel
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users} label="Total Students" value={students.length} gradient="bg-gradient-to-br from-primary to-primary-glow" />
        <StatCard icon={UserCheck} label="Present Today" value={presentToday} gradient="bg-gradient-to-br from-success to-success/80" />
        <StatCard icon={UserX} label="Absent Today" value={absentToday} gradient="bg-gradient-to-br from-destructive to-destructive/80" />
        <StatCard icon={DollarSign} label="Fees Collected" value={`KES ${totalCollected.toLocaleString()}`} gradient="bg-gradient-to-br from-warning to-warning/80" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Today's Attendance</h3>
          <p className="text-xs text-muted-foreground mb-4">Real-time attendance breakdown</p>
          {attendancePie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={attendancePie} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                    {attendancePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {attendancePie.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold text-foreground ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No data yet</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Fee Collection</h3>
          <p className="text-xs text-muted-foreground mb-4">{collectionRate}% collected</p>
          {feePie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={feePie} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                    {feePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {feePie.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold text-foreground ml-auto">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No fee records</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Collection Progress</h3>
          <p className="text-xs text-muted-foreground mb-4">Target vs collected</p>
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Collected</span>
                <span className="font-semibold text-foreground">KES {totalCollected.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-success to-success/70 transition-all duration-500" style={{ width: `${collectionRate}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Outstanding</span>
                <span className="font-semibold text-foreground">KES {(totalExpected - totalCollected).toLocaleString()}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70 transition-all duration-500" style={{ width: `${totalExpected > 0 ? 100 - collectionRate : 0}%` }} />
              </div>
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total Expected</span>
                <span className="font-bold text-foreground">KES {totalExpected.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Announcements + Students by Class */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Announcements */}
        <div className="bg-card rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-primary" /> Announcements
              </h3>
              <p className="text-xs text-muted-foreground">Post updates for students</p>
            </div>
            <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> New
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Announcement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAnnouncement} className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={announcementForm.title} onChange={e => setAnnouncementForm(f => ({ ...f, title: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Content</Label>
                    <Textarea value={announcementForm.content} onChange={e => setAnnouncementForm(f => ({ ...f, content: e.target.value }))} required rows={4} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? 'Posting...' : 'Post'}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">No announcements yet</p>
            ) : (
              announcements.map(a => (
                <div key={a.id} className="px-6 py-4 border-b last:border-b-0 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-medium text-sm text-foreground">{a.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{a.content}</p>
                      <p className="text-[10px] text-muted-foreground mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDeleteAnnouncement(a.id)} className="p-1.5 text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bar Chart */}
        {classBarData.length > 0 ? (
          <div className="bg-card rounded-xl p-6 shadow-sm border">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Students by Class</h3>
            <p className="text-xs text-muted-foreground mb-4">Distribution across classes</p>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={classBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="class" tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)', fontSize: '12px', boxShadow: '0 4px 12px rgb(0 0 0 / 0.08)' }} />
                <Bar dataKey="students" fill="hsl(217 91% 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-6 shadow-sm border flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No class data yet</p>
          </div>
        )}
      </div>

      {/* Recent Students Table */}
      <div className="bg-card rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-heading text-sm font-semibold text-foreground">Recent Students</h3>
          <p className="text-xs text-muted-foreground">Latest registered students</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Today</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Fees</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-muted-foreground text-sm">No students registered yet</td></tr>
              ) : (
                students.slice(0, 5).map(student => {
                  const att = todayAttendance.find(a => a.studentId === student.studentId);
                  const fee = fees.find(f => f.studentId === student.studentId);
                  return (
                    <tr key={student.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                      <td className="px-6 py-3 font-body text-muted-foreground">{student.studentId}</td>
                      <td className="px-6 py-3 font-medium">{student.name}</td>
                      <td className="px-6 py-3">
                        {att ? (
                          <span className={att.status === 'present' ? 'status-present' : 'status-absent'}>
                            {att.status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                      <td className="px-6 py-3">
                        {fee ? (
                          <span className={fee.paymentStatus === 'paid' ? 'status-paid' : fee.paymentStatus === 'partial' ? 'status-partial' : 'status-pending'}>
                            {fee.paymentStatus === 'paid' ? 'Paid' : fee.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                          </span>
                        ) : <span className="text-muted-foreground text-xs">—</span>}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ icon: Icon, label, value, gradient }: { icon: React.ElementType; label: string; value: string | number; gradient: string }) {
  return (
    <div className={`stat-card text-primary-foreground ${gradient}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium opacity-85 mb-1">{label}</p>
          <p className="text-2xl font-extrabold tabular-nums">{value}</p>
        </div>
        <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
