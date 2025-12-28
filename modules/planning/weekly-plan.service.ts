import { getTodayChecklist } from "../execution/day-log.service";
import {
  getHabitCompletionHistory,
  summarizeHabitCompletion
} from "../execution/habit.service";
import { loadGoalsOverview } from "../goals/goal.service";
import type {
  DailyAvailability,
  WeeklyHabitSnapshot,
  WeeklyPlanInput
} from "./planning.types";

const formatDate = (value: Date): string =>
  value.toISOString().split("T")[0];

const getWeekStart = (value?: string): string => {
  if (value) {
    return formatDate(new Date(value));
  }

  const now = new Date();
  const dayOfWeek = now.getUTCDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
  return formatDate(monday);
};

const buildAvailability = (
  weekStart: string,
  hoursPerDay: number,
  override?: DailyAvailability[]
): DailyAvailability[] => {
  if (override && override.length > 0) {
    return override;
  }

  const start = new Date(weekStart);
  return Array.from({ length: 7 }, (_, index) => {
    const current = new Date(start);
    current.setDate(start.getDate() + index);
    return {
      date: formatDate(current),
      availableHours: hoursPerDay
    };
  });
};

const buildHabitSnapshot = async (
  userId: string,
  habitName: string,
  historyDays: number
): Promise<WeeklyHabitSnapshot> => {
  const history = await getHabitCompletionHistory(userId, habitName, {
    days: historyDays
  });
  const summary = summarizeHabitCompletion(history);
  const lastCompletedAt =
    history.filter((point) => point.completed).map((point) => point.logDate).pop() ?? null;

  return {
    name: habitName,
    completionRate: summary.completionRate,
    currentStreak: summary.currentStreak,
    lastCompletedAt
  };
};

export interface WeeklyPlanContextOptions {
  weekStart?: string;
  availableHoursPerDay?: number;
  availableDays?: DailyAvailability[];
  historyDays?: number;
  habitNames?: string[];
  lastWeekCompletion?: number;
}

export const buildWeeklyPlanInput = async (
  userId: string,
  options?: WeeklyPlanContextOptions
): Promise<WeeklyPlanInput> => {
  const weekStart = getWeekStart(options?.weekStart);
  const historyDays = options?.historyDays ?? 7;
  const hoursPerDay = options?.availableHoursPerDay ?? 2;

  const [overview, dayLog] = await Promise.all([
    loadGoalsOverview(userId),
    getTodayChecklist(userId)
  ]);

  const habitNames =
    options?.habitNames ??
    dayLog.habits.map((habit) => habit.name);

  const snapshots: WeeklyHabitSnapshot[] = await Promise.all(
    habitNames.map((habitName) =>
      buildHabitSnapshot(userId, habitName, historyDays)
    )
  );

  const lastWeekCompletion =
    typeof options?.lastWeekCompletion === "number"
      ? options.lastWeekCompletion
      : snapshots.length === 0
      ? 0
      : snapshots.reduce((sum, snapshot) => sum + snapshot.completionRate, 0) /
        snapshots.length;

  const availableDays = buildAvailability(weekStart, hoursPerDay, options?.availableDays);

  return {
    userId,
    weekStart,
    goals: overview.goals,
    availableDays,
    habitSnapshots: snapshots,
    lastWeekCompletion
  };
};
