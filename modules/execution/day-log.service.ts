import type {
  DayLogWithHabits,
  HabitCompletionToggle
} from "./execution.types";
import {
  createDailyLog,
  getDayLogWithHabits,
  upsertHabitCheck
} from "./execution.repo";

const formatDate = (value: Date): string =>
  value.toISOString().split("T")[0]; // YYYY-MM-DD

const getCurrentDate = (override?: string): string => {
  if (override) {
    return formatDate(new Date(override));
  }

  return formatDate(new Date());
};

const ensureTodayOrFuture = (target: string): void => {
  const today = formatDate(new Date());
  if (target < today) {
    throw new Error("Cannot mutate logs for past dates");
  }
};

const ensureDayLog = async (userId: string, logDate: string): Promise<DayLogWithHabits> => {
  const existing = await getDayLogWithHabits(userId, logDate);
  if (existing) {
    return existing;
  }

  await createDailyLog(userId, logDate);
  const created = await getDayLogWithHabits(userId, logDate);
  if (!created) {
    throw new Error("Failed to create or fetch day log");
  }

  return created;
};

export const getTodayChecklist = async (
  userId: string,
  options?: { logDate?: string }
): Promise<DayLogWithHabits> => {
  const logDate = getCurrentDate(options?.logDate);
  return ensureDayLog(userId, logDate);
};

export const toggleHabitCompletion = async (
  payload: HabitCompletionToggle
): Promise<DayLogWithHabits> => {
  const logDate = getCurrentDate(payload.day);
  ensureTodayOrFuture(logDate);

  const dayLog = await ensureDayLog(payload.userId, logDate);
  const existing = dayLog.habits.find((habit) => habit.name === payload.habitName);
  const shouldComplete =
    payload.completed !== undefined ? payload.completed : !(existing?.completed ?? false);
  const notes = payload.notes ?? existing?.notes ?? null;

  await upsertHabitCheck({
    dailyLogId: dayLog.id,
    name: payload.habitName,
    completed: shouldComplete,
    notes
  });

  const refreshed = await getDayLogWithHabits(payload.userId, logDate);
  if (!refreshed) {
    throw new Error("Unable to refresh day log after habit toggle");
  }

  return refreshed;
};
