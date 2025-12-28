import { query } from "../../db/index";
import type {
  GoalProgressPoint,
  GoalRecord,
  GoalSummary
} from "./goal.types";

type GoalRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: number;
  is_active: boolean;
  is_completed: boolean;
  is_habit: boolean;
  category: string;
  cadence: string;
  created_at: string;
  updated_at: string;
};

type GoalProgressRow = {
  goal_id: string;
  log_date: string;
  completed: boolean;
  notes: string | null;
};

type GoalSummaryRow = {
  total_goals: number;
  prioritized: number;
  completed: number;
  active: number;
};

type HabitInsertArgs = {
  userId: string;
  title: string;
  description?: string | null;
  priority?: number;
  isActive?: boolean;
  category: HabitCategory;
  cadence: HabitCadence;
};

export type GoalUpdateArgs = Partial<{
  title: string;
  description: string | null;
  priority: number;
  isActive: boolean;
  isCompleted: boolean;
  category: HabitCategory;
  cadence: HabitCadence;
}>;

const toGoalRecord = (row: GoalRow): GoalRecord => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  description: row.description,
  priority: row.priority,
  isActive: row.is_active,
  isCompleted: row.is_completed,
  isHabit: row.is_habit,
  category: (row.category as HabitCategory) || "career",
  cadence: (row.cadence as HabitCadence) || "daily",
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toProgressPoint = (row: GoalProgressRow): GoalProgressPoint => ({
  goalId: row.goal_id,
  logDate: row.log_date,
  completed: row.completed,
  notes: row.notes
});

const formatDate = (value: Date): string => value.toISOString().split("T")[0];

export const getGoalsByUser = async (userId: string): Promise<GoalRecord[]> => {
  const { rows } = await query<GoalRow>(
    `
      SELECT *
      FROM goals
      WHERE user_id = $1
      ORDER BY priority DESC, created_at ASC
    `,
    [userId]
  );

  return rows.map(toGoalRecord);
};

export const getGoalProgressHistory = async (
  userId: string,
  options?: { days?: number }
): Promise<GoalProgressPoint[]> => {
  const days = options?.days ?? 7;
  if (days <= 0) {
    throw new Error("Days window must be greater than zero");
  }

  const endDate = new Date();
  const start = new Date(endDate);
  start.setDate(start.getDate() - (days - 1));
  const startDate = formatDate(start);

  const { rows } = await query<GoalProgressRow>(
    `
      SELECT
        gp.goal_id,
        gp.log_date,
        gp.completed,
        gp.notes
      FROM goal_progress gp
      JOIN goals g ON g.id = gp.goal_id
      WHERE g.user_id = $1
        AND gp.log_date >= $2
      ORDER BY gp.log_date ASC
    `,
    [userId, startDate]
  );

  return rows.map(toProgressPoint);
};

export const getGoalSummary = async (userId: string): Promise<GoalSummary> => {
  const { rows } = await query<GoalSummaryRow>(
    `
      SELECT
        COUNT(*) AS total_goals,
        COUNT(*) FILTER (WHERE priority > 0) AS prioritized,
        COUNT(*) FILTER (WHERE is_completed) AS completed,
        COUNT(*) FILTER (WHERE is_active AND NOT is_completed) AS active
      FROM goals
      WHERE user_id = $1
    `,
    [userId]
  );

  const summary = rows[0] ?? {
    total_goals: 0,
    prioritized: 0,
    completed: 0,
    active: 0
  };

  return {
    totalGoals: summary.total_goals,
    prioritized: summary.prioritized,
    completed: summary.completed,
    active: summary.active
  };
};

export const createHabitDefinition = async (
  args: HabitInsertArgs
): Promise<GoalRecord> => {
  const { rows } = await query<GoalRow>(
    `
      INSERT INTO goals (
        user_id,
        title,
        description,
        priority,
        is_active,
        is_completed,
        is_habit,
        category,
        cadence
      )
      VALUES ($1, $2, $3, $4, $5, FALSE, TRUE, $6, $7)
      RETURNING *
    `,
    [
      args.userId,
      args.title,
      args.description ?? null,
      args.priority ?? 0,
      args.isActive ?? true,
      args.category,
      args.cadence
    ]
  );

  if (!rows.length) {
    throw new Error("Failed to create habit definition");
  }

  return toGoalRecord(rows[0]);
};

export const updateGoalById = async (
  userId: string,
  goalId: string,
  updates: GoalUpdateArgs
): Promise<GoalRecord> => {
  const setClauses: string[] = [];
  const values: unknown[] = [];

  const add = (column: string, value: unknown) => {
    values.push(value);
    setClauses.push(`${column} = $${values.length}`);
  };

  if (updates.title !== undefined) add("title", updates.title);
  if (updates.description !== undefined) add("description", updates.description);
  if (updates.priority !== undefined) add("priority", updates.priority);
  if (updates.isActive !== undefined) add("is_active", updates.isActive);
  if (updates.isCompleted !== undefined) add("is_completed", updates.isCompleted);
  if (updates.category !== undefined) add("category", updates.category);
  if (updates.cadence !== undefined) add("cadence", updates.cadence);

  if (!setClauses.length) {
    throw new Error("No updates provided");
  }

  values.push(userId, goalId);

  const { rows } = await query<GoalRow>(
    `
      UPDATE goals
      SET ${setClauses.join(", ")}
      WHERE user_id = $${values.length - 1} AND id = $${values.length}
      RETURNING *
    `,
    values
  );

  if (!rows.length) {
    throw new Error("Unable to find goal");
  }

  return toGoalRecord(rows[0]);
};
