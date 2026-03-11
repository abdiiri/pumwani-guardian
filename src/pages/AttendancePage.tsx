import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function AttendancePage() {
  const { user } = useAuth();
  const { students, attendance, setAttendance } = useData();
  const isAdmin = user?.role === 'admin';
  const today = new Date().toISOString().split('T')[0];
  const [flashId, setFlashId] = useState<string | null>(null);

  const todayAttendance = attendance.filter(a => a.date === today);

  const handleMark = (studentId: string, status: 'present' | 'absent') => {
    if (!isAdmin) return;
    setAttendance(studentId, today, status);
    setFlashId(`${studentId}-${status}`);
    setTimeout(() => setFlashId(null), 200);
  };

  return (
    <DashboardLayout title="Attendance" subtitle={`Daily attendance — ${today}`}>
      <div className="border rounded-md bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Class</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const record = todayAttendance.find(a => a.studentId === student.studentId);
                const status = record?.status;

                return (
                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3 font-body">{student.studentId}</td>
                    <td className="px-6 py-3 font-medium">{student.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{student.class}</td>
                    <td className="px-6 py-3">
                      {isAdmin ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleMark(student.studentId, 'present')}
                            className={`attendance-btn-present ${status === 'present' ? 'active' : ''} ${flashId === `${student.studentId}-present` ? 'flash-confirm' : ''}`}
                          >
                            Present
                          </button>
                          <button
                            onClick={() => handleMark(student.studentId, 'absent')}
                            className={`attendance-btn-absent ${status === 'absent' ? 'active' : ''} ${flashId === `${student.studentId}-absent` ? 'flash-confirm' : ''}`}
                          >
                            Absent
                          </button>
                        </div>
                      ) : (
                        status ? (
                          <span className={status === 'present' ? 'status-present' : 'status-absent'}>
                            {status === 'present' ? 'Present' : 'Absent'}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">Not recorded</span>
                        )
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
