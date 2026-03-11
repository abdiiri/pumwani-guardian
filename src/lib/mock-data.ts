import { User, Student, AttendanceRecord, FeeRecord } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Kamau', email: 'admin@pumwani.ac.ke', role: 'admin' },
  { id: 'u2', name: 'Mary Wanjiku', email: 'manager@pumwani.ac.ke', role: 'manager' },
  { id: 'u3', name: 'James Ochieng', email: 'james@pumwani.ac.ke', role: 'student', studentId: 'STU001', class: 'Form 1A' },
  { id: 'u4', name: 'Peter Mwangi', email: 'peter@pumwani.ac.ke', role: 'student', studentId: 'STU002', class: 'Form 1A' },
  { id: 'u5', name: 'David Kipchoge', email: 'david@pumwani.ac.ke', role: 'student', studentId: 'STU003', class: 'Form 2A' },
  { id: 'u6', name: 'Samuel Otieno', email: 'samuel@pumwani.ac.ke', role: 'student', studentId: 'STU004', class: 'Form 2A' },
  { id: 'u7', name: 'Brian Wafula', email: 'brian@pumwani.ac.ke', role: 'student', studentId: 'STU005', class: 'Form 3A' },
  { id: 'u8', name: 'Kevin Njoroge', email: 'kevin@pumwani.ac.ke', role: 'student', studentId: 'STU006', class: 'Form 3A' },
  { id: 'u9', name: 'Victor Mutua', email: 'victor@pumwani.ac.ke', role: 'student', studentId: 'STU007', class: 'Form 4A' },
  { id: 'u10', name: 'Dennis Kirui', email: 'dennis@pumwani.ac.ke', role: 'student', studentId: 'STU008', class: 'Form 4A' },
];

export const mockStudents: Student[] = mockUsers
  .filter(u => u.role === 'student')
  .map(u => ({
    id: u.id,
    studentId: u.studentId!,
    name: u.name,
    email: u.email,
    class: u.class!,
    userId: u.id,
  }));

const today = new Date().toISOString().split('T')[0];

export const mockAttendance: AttendanceRecord[] = [
  { id: 'a1', studentId: 'STU001', date: today, status: 'present' },
  { id: 'a2', studentId: 'STU002', date: today, status: 'present' },
  { id: 'a3', studentId: 'STU003', date: today, status: 'absent' },
  { id: 'a4', studentId: 'STU004', date: today, status: 'present' },
  { id: 'a5', studentId: 'STU005', date: today, status: 'absent' },
  { id: 'a6', studentId: 'STU006', date: today, status: 'present' },
  { id: 'a7', studentId: 'STU007', date: today, status: 'present' },
  { id: 'a8', studentId: 'STU008', date: today, status: 'absent' },
];

export const mockFees: FeeRecord[] = [
  { id: 'f1', studentId: 'STU001', amountPaid: 45000, totalAmount: 45000, paymentStatus: 'paid', date: '2026-01-15' },
  { id: 'f2', studentId: 'STU002', amountPaid: 20000, totalAmount: 45000, paymentStatus: 'partial', date: '2026-02-01' },
  { id: 'f3', studentId: 'STU003', amountPaid: 45000, totalAmount: 45000, paymentStatus: 'paid', date: '2026-01-20' },
  { id: 'f4', studentId: 'STU004', amountPaid: 0, totalAmount: 45000, paymentStatus: 'pending', date: '' },
  { id: 'f5', studentId: 'STU005', amountPaid: 45000, totalAmount: 45000, paymentStatus: 'paid', date: '2026-03-01' },
  { id: 'f6', studentId: 'STU006', amountPaid: 30000, totalAmount: 45000, paymentStatus: 'partial', date: '2026-02-15' },
  { id: 'f7', studentId: 'STU007', amountPaid: 0, totalAmount: 45000, paymentStatus: 'pending', date: '' },
  { id: 'f8', studentId: 'STU008', amountPaid: 45000, totalAmount: 45000, paymentStatus: 'paid', date: '2026-01-10' },
];
