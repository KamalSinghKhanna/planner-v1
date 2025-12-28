export interface UserRecord {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface DailyLogRecord {
  id: string;
  userId: string;
  logDate: string;
  summary: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HabitCheckRecord {
  id: string;
  dailyLogId: string;
  name: string;
  completed: boolean;
  notes: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DayLogWithHabits extends DailyLogRecord {
  habits: HabitCheckRecord[];
}

export interface HabitCompletionToggle {
  userId: string;
  day?: string;
  habitName: string;
  completed?: boolean;
  notes?: string;
}

export interface DailyChecklistItem {
  name: string;
  completed: boolean;
  notes?: string;
}

export interface DailyChecklist {
  logDate: string;
  userId: string;
  items: DailyChecklistItem[];
}

export interface HabitCompletionPoint {
  logDate: string;
  completed: boolean;
}

export interface HabitCompletionSummary {
  totalDays: number;
  completedDays: number;
  completionRate: number;
  currentStreak: number;
}
