import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  class: string;
  userId: string | null;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: 'present' | 'absent';
}

export interface FeeRecord {
  id: string;
  studentId: string;
  amountPaid: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'partial';
  date: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

interface DataContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  announcements: Announcement[];
  loading: boolean;
  addStudent: (s: { name: string; email: string; studentId: string; class: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  updateStudent: (id: string, s: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  setAttendance: (studentId: string, date: string, status: 'present' | 'absent') => Promise<void>;
  updateFee: (studentId: string, amountPaid: number) => Promise<void>;
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendanceState] = useState<AttendanceRecord[]>([]);
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);

    const [studentsRes, attendanceRes, feesRes, announcementsRes] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('attendance').select('*'),
      supabase.from('fees').select('*'),
      supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    ]);

    if (studentsRes.data) {
      setStudents(studentsRes.data.map((s: any) => ({
        id: s.id,
        studentId: s.student_id,
        name: s.name,
        email: s.email,
        class: s.class,
        userId: s.user_id,
      })));
    }

    if (attendanceRes.data) {
      setAttendanceState(attendanceRes.data.map((a: any) => ({
        id: a.id,
        studentId: a.student_id,
        date: a.date,
        status: a.status as 'present' | 'absent',
      })));
    }

    if (feesRes.data) {
      setFees(feesRes.data.map((f: any) => ({
        id: f.id,
        studentId: f.student_id,
        amountPaid: Number(f.amount_paid),
        totalAmount: Number(f.total_amount),
        paymentStatus: f.payment_status as 'paid' | 'pending' | 'partial',
        date: f.date || '',
      })));
    }

    if (announcementsRes.data) {
      setAnnouncements(announcementsRes.data.map((a: any) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        createdBy: a.created_by,
        createdAt: a.created_at,
      })));
    }

    setLoading(false);
  }, [isAuthenticated]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const addStudent = async (s: { name: string; email: string; studentId: string; class: string; password: string }) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) return { success: false, error: 'Not authenticated' };

    const res = await supabase.functions.invoke('create-user', {
      body: {
        email: s.email,
        password: s.password,
        name: s.name,
        role: 'student',
        studentId: s.studentId,
        studentClass: s.class,
      },
    });

    if (res.error || res.data?.error) {
      return { success: false, error: res.data?.error || res.error?.message || 'Failed to create student' };
    }

    await fetchAll();
    return { success: true };
  };

  const updateStudent = async (id: string, updates: Partial<Student>) => {
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.class !== undefined) dbUpdates.class = updates.class;

    await supabase.from('students').update(dbUpdates).eq('id', id);
    await fetchAll();
  };

  const deleteStudent = async (id: string) => {
    const student = students.find(s => s.id === id);
    if (!student || !student.userId) return;

    await supabase.functions.invoke('delete-user', {
      body: { userId: student.userId },
    });

    await fetchAll();
  };

  const setAttendanceRecord = async (studentId: string, date: string, status: 'present' | 'absent') => {
    const existing = attendance.find(a => a.studentId === studentId && a.date === date);
    if (existing) {
      await supabase.from('attendance').update({ status }).eq('id', existing.id);
    } else {
      await supabase.from('attendance').insert({
        student_id: studentId,
        date,
        status,
      });
    }
    await fetchAll();
  };

  const updateFee = async (studentId: string, amountPaid: number) => {
    const fee = fees.find(f => f.studentId === studentId);
    if (!fee) return;

    const paymentStatus = amountPaid >= fee.totalAmount ? 'paid' : amountPaid > 0 ? 'partial' : 'pending';
    await supabase.from('fees').update({
      amount_paid: amountPaid,
      payment_status: paymentStatus,
      date: new Date().toISOString().split('T')[0],
    }).eq('id', fee.id);

    await fetchAll();
  };

  return (
    <DataContext.Provider value={{
      students, attendance, fees, announcements, loading,
      addStudent, updateStudent, deleteStudent,
      setAttendance: setAttendanceRecord,
      updateFee, refresh: fetchAll,
    }}>
      {children}
    </DataContext.Provider>
  );
};
