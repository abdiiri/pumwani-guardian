import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { Megaphone, CalendarCheck, DollarSign, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { attendance, fees, announcements } = useData();

  if (!user || !user.studentId) return null;

  const myAttendance = attendance.filter(a => a.studentId === user.studentId);
  const myFee = fees.find(f => f.studentId === user.studentId);
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;
  const totalDays = presentDays + absentDays;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  const feesPaid = myFee?.amountPaid || 0;
  const feesTotal = myFee?.totalAmount || 0;
  const feesBalance = feesTotal - feesPaid;
  const feeProgress = feesTotal > 0 ? Math.round((feesPaid / feesTotal) * 100) : 0;

  const attendancePie = [
    { name: 'Present', value: presentDays, color: 'hsl(160 84% 39%)' },
    { name: 'Absent', value: absentDays, color: 'hsl(0 72% 51%)' },
  ].filter(d => d.value > 0);

  const feePie = [
    { name: 'Paid', value: feesPaid, color: 'hsl(160 84% 39%)' },
    { name: 'Balance', value: feesBalance, color: 'hsl(0 72% 51%)' },
  ].filter(d => d.value > 0);

  // Monthly attendance for bar chart
  const monthlyData: Record<string, { present: number; absent: number }> = {};
  myAttendance.forEach(a => {
    const month = a.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[month]) monthlyData[month] = { present: 0, absent: 0 };
    monthlyData[month][a.status]++;
  });
  const monthlyBarData = Object.entries(monthlyData)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, data]) => ({
      month: new Date(month + '-01').toLocaleDateString('en', { month: 'short' }),
      Present: data.present,
      Absent: data.absent,
    }));

  return (
    <DashboardLayout title="My Dashboard" subtitle={`Welcome, ${user.name}`}>
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card text-primary-foreground bg-gradient-to-br from-success to-success/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-85 mb-1">Days Present</p>
              <p className="text-2xl font-extrabold tabular-nums">{presentDays}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card text-primary-foreground bg-gradient-to-br from-destructive to-destructive/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-85 mb-1">Days Absent</p>
              <p className="text-2xl font-extrabold tabular-nums">{absentDays}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <CalendarCheck className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card text-primary-foreground bg-gradient-to-br from-primary to-primary-glow">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-85 mb-1">Fees Paid</p>
              <p className="text-2xl font-extrabold tabular-nums">KES {feesPaid.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="stat-card text-primary-foreground bg-gradient-to-br from-warning to-warning/80">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-85 mb-1">Balance</p>
              <p className="text-2xl font-extrabold tabular-nums">KES {feesBalance.toLocaleString()}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Attendance Pie */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Attendance Overview</h3>
          <p className="text-xs text-muted-foreground mb-4">{attendanceRate}% attendance rate</p>
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
            <p className="text-sm text-muted-foreground text-center py-8">No attendance data</p>
          )}
        </div>

        {/* Fee Progress */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Fee Payment</h3>
          <p className="text-xs text-muted-foreground mb-4">{feeProgress}% paid</p>
          {feePie.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={120} height={120}>
                <PieChart>
                  <Pie data={feePie} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={55} paddingAngle={3} strokeWidth={0}>
                    {feePie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {feePie.map((d, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                    <span className="text-muted-foreground">{d.name}</span>
                    <span className="font-semibold text-foreground ml-auto">KES {d.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No fee data</p>
          )}
        </div>

        {/* Fee Progress Bar */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Payment Progress</h3>
          <p className="text-xs text-muted-foreground mb-4">Total: KES {feesTotal.toLocaleString()}</p>
          <div className="space-y-4 mt-2">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Paid</span>
                <span className="font-semibold text-foreground">KES {feesPaid.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-success to-success/70 transition-all duration-500" style={{ width: `${feeProgress}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-muted-foreground">Balance</span>
                <span className="font-semibold text-foreground">KES {feesBalance.toLocaleString()}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-destructive to-destructive/70 transition-all duration-500" style={{ width: `${feesTotal > 0 ? 100 - feeProgress : 0}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Attendance + Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Monthly Bar Chart */}
        <div className="bg-card rounded-xl p-6 shadow-sm border">
          <h3 className="font-heading text-sm font-semibold text-foreground mb-1">Monthly Attendance</h3>
          <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
          {monthlyBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={monthlyBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 91%)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'hsl(220 9% 46%)' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220 13% 91%)', fontSize: '12px' }} />
                <Bar dataKey="Present" fill="hsl(160 84% 39%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Absent" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">No attendance records yet</p>
          )}
        </div>

        {/* Announcements */}
        <div className="bg-card rounded-xl shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h3 className="font-heading text-sm font-semibold text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Announcements
            </h3>
            <p className="text-xs text-muted-foreground">Latest school updates</p>
          </div>
          <div className="max-h-[250px] overflow-y-auto">
            {announcements.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground text-sm">No announcements</p>
            ) : (
              announcements.map(a => (
                <div key={a.id} className="px-6 py-4 border-b last:border-b-0">
                  <h4 className="font-medium text-sm text-foreground">{a.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{a.content}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-card rounded-xl shadow-sm border">
        <div className="px-6 py-4 border-b">
          <h3 className="font-heading text-sm font-semibold text-foreground">Attendance History</h3>
        </div>
        <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-card">
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {myAttendance.length === 0 ? (
                <tr><td colSpan={2} className="px-6 py-8 text-center text-muted-foreground">No attendance records yet.</td></tr>
              ) : (
                myAttendance.map(a => (
                  <tr key={a.id} className="border-b last:border-b-0">
                    <td className="px-6 py-3 font-body">{a.date}</td>
                    <td className="px-6 py-3">
                      <span className={a.status === 'present' ? 'status-present' : 'status-absent'}>
                        {a.status === 'present' ? 'Present' : 'Absent'}
                      </span>
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
