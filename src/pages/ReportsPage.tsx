import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ReportsPage() {
  const { students, attendance, fees } = useData();
  const today = new Date().toISOString().split('T')[0];

  const todayAtt = attendance.filter(a => a.date === today);
  const present = todayAtt.filter(a => a.status === 'present').length;
  const absent = todayAtt.filter(a => a.status === 'absent').length;

  const paid = fees.filter(f => f.paymentStatus === 'paid').length;
  const partial = fees.filter(f => f.paymentStatus === 'partial').length;
  const pending = fees.filter(f => f.paymentStatus === 'pending').length;

  const attendanceData = [
    { name: 'Present', value: present },
    { name: 'Absent', value: absent },
    { name: 'Unmarked', value: Math.max(0, students.length - present - absent) },
  ];

  const feeData = [
    { name: 'Paid', value: paid },
    { name: 'Partial', value: partial },
    { name: 'Pending', value: pending },
  ];

  const barColors: Record<string, string> = {
    Present: 'hsl(145, 63%, 42%)',
    Absent: 'hsl(354, 70%, 54%)',
    Unmarked: 'hsl(0, 0%, 63%)',
    Paid: 'hsl(145, 63%, 42%)',
    Partial: 'hsl(220, 45%, 42%)',
    Pending: 'hsl(354, 70%, 54%)',
  };

  return (
    <DashboardLayout title="Reports" subtitle="Attendance and fee statistics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance chart */}
        <div className="border rounded-md bg-card p-6">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-6">Today's Attendance</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attendanceData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(0,0%,63%)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(0,0%,10%)' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                {attendanceData.map(entry => (
                  <Cell key={entry.name} fill={barColors[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fee chart */}
        <div className="border rounded-md bg-card p-6">
          <h2 className="font-heading text-sm font-semibold text-foreground mb-6">Fee Payment Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={feeData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0,0%,92%)" />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'hsl(0,0%,63%)' }} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: 'hsl(0,0%,10%)' }} width={80} />
              <Tooltip />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={28}>
                {feeData.map(entry => (
                  <Cell key={entry.name} fill={barColors[entry.name]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary stats */}
      <div className="border rounded-md bg-card px-8 py-6 mt-6">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">Summary</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Total Students</p>
            <p className="text-2xl font-heading font-bold tabular-nums mt-1">{students.length}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Attendance Rate</p>
            <p className="text-2xl font-heading font-bold tabular-nums mt-1">
              {students.length > 0 ? `${Math.round((present / Math.max(1, present + absent)) * 100)}%` : '—'}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Fees Collected</p>
            <p className="text-2xl font-heading font-bold tabular-nums mt-1">
              KES {fees.reduce((sum, f) => sum + f.amountPaid, 0).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Outstanding</p>
            <p className="text-2xl font-heading font-bold tabular-nums mt-1">
              KES {fees.reduce((sum, f) => sum + (f.totalAmount - f.amountPaid), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
