import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';

export default function AdminDashboard() {
  const { students, attendance, fees } = useData();
  const today = new Date().toISOString().split('T')[0];

  const todayAttendance = attendance.filter(a => a.date === today);
  const presentToday = todayAttendance.filter(a => a.status === 'present').length;
  const absentToday = todayAttendance.filter(a => a.status === 'absent').length;
  const feesPaid = fees.filter(f => f.paymentStatus === 'paid').length;
  const feesPending = fees.filter(f => f.paymentStatus === 'pending' || f.paymentStatus === 'partial').length;

  return (
    <DashboardLayout title="Dashboard" subtitle="Today's overview">
      {/* Daily Register — single authoritative block */}
      <div className="border rounded-md bg-card px-8 py-8 mb-8">
        <h2 className="font-heading text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
          Daily Register
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <RegisterFigure label="Total Students" value={students.length} />
          <RegisterFigure label="Present" value={presentToday} accent="success" />
          <RegisterFigure label="Absent" value={absentToday} accent="destructive" />
          <RegisterFigure label="Fees Paid" value={feesPaid} />
        </div>
      </div>

      {/* Recent Students Table */}
      <div className="border rounded-md bg-card">
        <div className="px-6 py-4 border-b">
          <h2 className="font-heading text-sm font-semibold text-foreground">Recent Students</h2>
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
              {students.slice(0, 6).map(student => {
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
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      {fee ? (
                        <span className={fee.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}>
                          {fee.paymentStatus === 'paid' ? 'Paid' : fee.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
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

function RegisterFigure({ label, value, accent }: { label: string; value: number; accent?: 'success' | 'destructive' }) {
  const colorClass = accent === 'success'
    ? 'text-success'
    : accent === 'destructive'
    ? 'text-destructive'
    : 'text-foreground';

  return (
    <div>
      <p className="text-xs text-muted-foreground font-heading uppercase tracking-wider mb-2">{label}</p>
      <p className={`text-4xl font-heading font-bold tabular-nums ${colorClass}`}>
        {value}
      </p>
    </div>
  );
}
