import { query } from "../../db/index";
import type {
  HabitCompletionPoint,
  HabitCompletionSummary
} from "./execution.types";

const formatDate = (value: Date): string => value.toISOString().split("T")[0];

const buildSummary = (history: HabitCompletionPoint[]): HabitCompletionSummary => {
  const totalDays = history.length;
  const completedDays = history.filter((point) => point.completed).length;
  const completionRate = totalDays === 0 ? 0 : completedDays / totalDays;

  let currentStreak = 0;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (!history[index].completed) {
      break;
    }
    currentStreak += 1;
  }

  return {
    totalDays,
    completedDays,
    completionRate,
    currentStreak
  };
};

export const getHabitCompletionHistory = async (
  userId: string,
  habitName: string,
  options?: { days?: number }
): Promise<HabitCompletionPoint[]> => {
  const days = options?.days ?? 7;
  if (days <= 0) {
    throw new Error("Days window must be greater than zero");
  }

  const endDate = new Date();
  const start = new Date(endDate);
  start.setDate(start.getDate() - (days - 1));
  const startDate = formatDate(start);
  const endDateString = formatDate(endDate);

  const { rows } = await query<{
    log_date: string;
    completed: boolean | null;
  }>(
    `
      WITH series AS (
        SELECT generate_series($1::date, $2::date, '1 day') AS log_date
      )
      SELECT
        s.log_date,
        COALESCE(hc.completed, FALSE) AS completed
      FROM series s
      LEFT JOIN daily_logs dl ON dl.user_id = $3 AND dl.log_date = s.log_date
      LEFT JOIN habit_checks hc ON hc.daily_log_id = dl.id AND hc.name = $4
      ORDER BY s.log_date ASC
    `,
    [startDate, endDateString, userId, habitName]
  );

  return rows.map((row) => ({
    logDate: row.log_date,
    completed: Boolean(row.completed)
  }));
};

export const summarizeHabitCompletion = (
  history: HabitCompletionPoint[]
): HabitCompletionSummary => buildSummary(history);
