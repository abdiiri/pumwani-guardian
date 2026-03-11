import { DashboardLayout } from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

export default function StudentDashboard() {
  const { user } = useAuth();
  const { attendance, fees } = useData();

  if (!user || !user.studentId) return null;

  const myAttendance = attendance.filter(a => a.studentId === user.studentId);
  const myFee = fees.find(f => f.studentId === user.studentId);
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;

  return (
    <DashboardLayout title="My Dashboard" subtitle={`Welcome, ${user.name}`}>
      {/* Personal register */}
      <div className="border rounded-md bg-card px-8 py-8 mb-8">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          My Records
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Days Present</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-success">{presentDays}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Days Absent</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-destructive">{absentDays}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Fees Paid</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-foreground">
              {myFee ? `${(myFee.amountPaid / 1000).toFixed(0)}K` : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Balance</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-foreground">
              {myFee ? `${((myFee.totalAmount - myFee.amountPaid) / 1000).toFixed(0)}K` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Attendance history */}
      <div className="border rounded-md bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-heading text-sm font-semibold text-foreground">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
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
