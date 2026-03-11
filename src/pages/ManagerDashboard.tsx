import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';

export default function ManagerDashboard() {
  const { students, attendance, fees } = useData();
  const today = new Date().toISOString().split('T')[0];

  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;

  return (
    <DashboardLayout title="Dashboard" subtitle="Monitor school activities">
      <div className="border rounded-md bg-card px-8 py-8 mb-8">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Daily Register
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Total Students</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-foreground">{students.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Present</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-success">{presentToday}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Absent</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-destructive">{absentToday}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">Fees Paid</p>
            <p className="text-4xl font-heading font-bold tabular-nums text-foreground">{fees.filter(f => f.paymentStatus === 'paid').length}</p>
          </div>
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-heading text-sm font-semibold text-foreground">Student Overview</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Today</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Fees</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const att = todayAttendance.find(a => a.studentId === student.studentId);
                const fee = fees.find(f => f.studentId === student.studentId);
                return (
                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3 font-body">{student.studentId}</td>
                    <td className="px-6 py-3 font-medium">{student.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{student.class}</td>
                    <td className="px-6 py-3">
                      {att ? (
                        <span className={att.status === 'present' ? 'status-present' : 'status-absent'}>
                          {att.status === 'present' ? 'Present' : 'Absent'}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-6 py-3">
                      {fee ? (
                        <span className={fee.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}>
                          {fee.paymentStatus === 'paid' ? 'Paid' : fee.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
