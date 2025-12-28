export type HabitCategory = "career" | "product" | "health" | "communication";
export type HabitCadence = "daily" | "weekday" | "weekend";

export interface GoalRecord {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  isCompleted: boolean;
  isHabit: boolean;
  category: HabitCategory;
  cadence: HabitCadence;
  createdAt: string;
  updatedAt: string;
}

export interface GoalSummary {
  totalGoals: number;
  prioritized: number;
  completed: number;
  active: number;
}

export interface GoalProgressPoint {
  goalId: string;
  logDate: string;
  completed: boolean;
  notes?: string | null;
}
