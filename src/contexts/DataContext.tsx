import React, { createContext, useContext, useState } from 'react';
import { Student, AttendanceRecord, FeeRecord } from '@/lib/types';
import { mockStudents, mockAttendance, mockFees } from '@/lib/mock-data';

interface DataContextType {
  students: Student[];
  attendance: AttendanceRecord[];
  fees: FeeRecord[];
  addStudent: (s: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, s: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  setAttendance: (studentId: string, date: string, status: 'present' | 'absent') => void;
  updateFee: (studentId: string, amountPaid: number) => void;
}

const DataContext = createContext<DataContextType | null>(null);

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [fees, setFees] = useState<FeeRecord[]>(mockFees);

  const addStudent = (s: Omit<Student, 'id'>) => {
    const newStudent: Student = { ...s, id: `u${Date.now()}` };
    setStudents(prev => [...prev, newStudent]);
    // Create a pending fee record
    setFees(prev => [...prev, {
      id: `f${Date.now()}`,
      studentId: s.studentId,
      amountPaid: 0,
      totalAmount: 45000,
      paymentStatus: 'pending',
      date: '',
    }]);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const deleteStudent = (id: string) => {
    const student = students.find(s => s.id === id);
    if (student) {
      setStudents(prev => prev.filter(s => s.id !== id));
      setAttendance(prev => prev.filter(a => a.studentId !== student.studentId));
      setFees(prev => prev.filter(f => f.studentId !== student.studentId));
    }
  };

  const setAttendanceRecord = (studentId: string, date: string, status: 'present' | 'absent') => {
    setAttendance(prev => {
      const existing = prev.findIndex(a => a.studentId === studentId && a.date === date);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { ...updated[existing], status };
        return updated;
      }
      return [...prev, { id: `a${Date.now()}`, studentId, date, status }];
    });
  };

  const updateFee = (studentId: string, amountPaid: number) => {
    setFees(prev => prev.map(f => {
      if (f.studentId !== studentId) return f;
      const newAmount = amountPaid;
      return {
        ...f,
        amountPaid: newAmount,
        paymentStatus: newAmount >= f.totalAmount ? 'paid' : newAmount > 0 ? 'partial' : 'pending',
        date: new Date().toISOString().split('T')[0],
      };
    }));
  };

  return (
    <DataContext.Provider value={{
      students, attendance, fees,
      addStudent, updateStudent, deleteStudent,
      setAttendance: setAttendanceRecord,
      updateFee,
    }}>
      {children}
    </DataContext.Provider>
  );
};
