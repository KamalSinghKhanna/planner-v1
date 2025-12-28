import {
  getGoalProgressHistory,
  getGoalSummary,
  getGoalsByUser
} from "./goal.repo";
import type {
  GoalProgressPoint,
  GoalRecord,
  GoalSummary
} from "./goal.types";

export interface GoalsOverview {
  goals: GoalRecord[];
  summary: GoalSummary;
}

export const loadGoalsOverview = async (userId: string): Promise<GoalsOverview> => {
  const [goals, summary] = await Promise.all([
    getGoalsByUser(userId),
    getGoalSummary(userId)
  ]);

  return { goals, summary };
};

export const loadGoalProgress = async (
  userId: string,
  options?: { days?: number }
): Promise<GoalProgressPoint[]> => getGoalProgressHistory(userId, options);

export const aggregateProgressByGoal = (
  history: GoalProgressPoint[]
): Record<string, { completed: number; total: number; rate: number }> => {
  const accumulator: Record<string, { completed: number; total: number }> = {};

  history.forEach((point) => {
    const bucket = accumulator[point.goalId] ?? { completed: 0, total: 0 };
    bucket.total += 1;
    if (point.completed) {
      bucket.completed += 1;
    }
    accumulator[point.goalId] = bucket;
  });

  return Object.fromEntries(
    Object.entries(accumulator).map(([goalId, counts]) => [
      goalId,
      {
        completed: counts.completed,
        total: counts.total,
        rate: counts.total === 0 ? 0 : counts.completed / counts.total
      }
    ])
  );
};
