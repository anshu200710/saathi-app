export interface Compliance {
  id: string;
  name: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  category: string;
  description?: string;
}

export interface ComplianceCalendar {
  month: number;
  year: number;
  items: Compliance[];
}
