import { query } from "../../db/index";
import type {
  DailyLogRecord,
  DayLogWithHabits,
  HabitCheckRecord
} from "./execution.types";

type DailyLogRow = {
  id: string;
  user_id: string;
  log_date: string;
  summary: string | null;
  created_at: string;
  updated_at: string;
};

type HabitCheckRow = {
  id: string;
  daily_log_id: string;
  name: string;
  completed: boolean;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

type HabitUpsertArgs = {
  dailyLogId: string;
  name: string;
  completed: boolean;
  notes?: string | null;
};

const toDailyLog = (row: DailyLogRow): DailyLogRecord => ({
  id: row.id,
  userId: row.user_id,
  logDate: row.log_date,
  summary: row.summary,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toHabitCheck = (row: HabitCheckRow): HabitCheckRecord => ({
  id: row.id,
  dailyLogId: row.daily_log_id,
  name: row.name,
  completed: row.completed,
  notes: row.notes,
  completedAt: row.completed_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const getDailyLogByDate = async (
  userId: string,
  logDate: string
): Promise<DailyLogRecord | null> => {
  const { rows } = await query<DailyLogRow>(
    `
      SELECT *
      FROM daily_logs
      WHERE user_id = $1
        AND log_date = $2
      LIMIT 1
    `,
    [userId, logDate]
  );

  if (!rows.length) {
    return null;
  }

  return toDailyLog(rows[0]);
};

export const createDailyLog = async (
  userId: string,
  logDate: string
): Promise<DailyLogRecord> => {
  const { rows } = await query<DailyLogRow>(
    `
      INSERT INTO daily_logs (user_id, log_date)
      VALUES ($1, $2)
      ON CONFLICT (user_id, log_date)
      DO UPDATE SET summary = daily_logs.summary
      RETURNING *
    `,
    [userId, logDate]
  );

  if (!rows.length) {
    const existing = await getDailyLogByDate(userId, logDate);
    if (!existing) {
      throw new Error("Unable to ensure daily log entry");
    }
    return existing;
  }

  return toDailyLog(rows[0]);
};

export const getHabitChecksByLogId = async (
  dailyLogId: string
): Promise<HabitCheckRecord[]> => {
  const { rows } = await query<HabitCheckRow>(
    `
      SELECT *
      FROM habit_checks
      WHERE daily_log_id = $1
      ORDER BY created_at ASC
    `,
    [dailyLogId]
  );

  return rows.map(toHabitCheck);
};

export const upsertHabitCheck = async ({
  dailyLogId,
  name,
  completed,
  notes = null
}: HabitUpsertArgs): Promise<HabitCheckRecord> => {
  const { rows } = await query<HabitCheckRow>(
    `
      INSERT INTO habit_checks (
        daily_log_id,
        name,
        completed,
        notes,
        completed_at
      )
      VALUES ($1, $2, $3, $4, CASE WHEN $3 THEN now() ELSE NULL END)
      ON CONFLICT (daily_log_id, name)
      DO UPDATE SET
        completed = EXCLUDED.completed,
        notes = EXCLUDED.notes,
        completed_at = CASE WHEN EXCLUDED.completed THEN now() ELSE NULL END,
        updated_at = now()
      RETURNING *
    `,
    [dailyLogId, name, completed, notes]
  );

  if (!rows.length) {
    throw new Error("Failed to upsert habit check");
  }

  return toHabitCheck(rows[0]);
};

export const getDayLogWithHabits = async (
  userId: string,
  logDate: string
): Promise<DayLogWithHabits | null> => {
  const log = await getDailyLogByDate(userId, logDate);
  if (!log) {
    return null;
  }

  const habits = await getHabitChecksByLogId(log.id);
  return {
    ...log,
    habits
  };
};
