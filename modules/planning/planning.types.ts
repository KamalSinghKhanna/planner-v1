export type WeeklyGoal = {
  id: string;
  title: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  isCompleted: boolean;
};

export type WeeklyHabitSnapshot = {
  name: string;
  completionRate: number;
  currentStreak: number;
  lastCompletedAt?: string | null;
};

export type DailyAvailability = {
  date: string;
  availableHours: number;
};

export type WeeklyPlanInput = {
  userId: string;
  weekStart: string;
  goals: WeeklyGoal[];
  availableDays: DailyAvailability[];
  habitSnapshots: WeeklyHabitSnapshot[];
  lastWeekCompletion: number;
};

export type WeeklyPlanPriority = {
  goalId: string | null;
  title: string;
  description: string;
  estimatedHours: number;
  confidence: "low" | "medium" | "high";
};

export type MinimumViableDay = {
  day: string;
  focusItems: string[];
  fallbackHabits: string[];
};

export type WeeklyPlanDraft = {
  weekStart: string;
  priorities: WeeklyPlanPriority[];
  minimumViableDay: MinimumViableDay;
  notes?: string;
};
