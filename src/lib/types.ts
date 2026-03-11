export type UserRole = 'admin' | 'manager' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  studentId?: string;
  class?: string;
}

export interface Student {
  id: string;
  studentId: string;
  name: string;
  email: string;
  class: string;
  userId: string;
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
