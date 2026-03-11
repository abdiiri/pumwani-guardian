import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export default function FeesPage() {
  const { user } = useAuth();
  const { students, fees, updateFee } = useData();
  const isAdmin = user?.role === 'admin';
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  const handleSave = () => {
    if (editingStudentId && amount) {
      updateFee(editingStudentId, parseInt(amount));
      setEditingStudentId(null);
      setAmount('');
    }
  };

  return (
    <DashboardLayout title="Fees" subtitle="Fee payment records">
      <div className="border rounded-md bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm sticky-table">
            <thead>
              <tr className="border-b">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">ID</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Class</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Paid</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Total</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                {isAdmin && (
                  <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {students.map(student => {
                const fee = fees.find(f => f.studentId === student.studentId);
                return (
                  <tr key={student.id} className="border-b last:border-b-0 hover:bg-accent/50 transition-colors">
                    <td className="px-6 py-3 font-body">{student.studentId}</td>
                    <td className="px-6 py-3 font-medium">{student.name}</td>
                    <td className="px-6 py-3 text-muted-foreground">{student.class}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{fee ? `KES ${fee.amountPaid.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-3 text-right tabular-nums">{fee ? `KES ${fee.totalAmount.toLocaleString()}` : '—'}</td>
                    <td className="px-6 py-3">
                      {fee ? (
                        <span className={fee.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}>
                          {fee.paymentStatus === 'paid' ? 'Paid' : fee.paymentStatus === 'partial' ? 'Partial' : 'Pending'}
                        </span>
                      ) : '—'}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-3 text-right">
                        <button
                          onClick={() => { setEditingStudentId(student.studentId); setAmount(fee?.amountPaid.toString() || '0'); }}
                          className="text-xs text-primary hover:underline font-medium"
                        >
                          Update
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingStudentId} onOpenChange={() => setEditingStudentId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Amount Paid (KES)</Label>
              <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingStudentId(null)}>Cancel</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
