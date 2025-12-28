import { query } from "../../db/index";
import type {
  WeeklyReviewInsight,
  WeeklyReviewPayload
} from "./review.types";

type WeeklyReviewRow = {
  id: string;
  user_id: string;
  week_start: string;
  completed_goals: number;
  total_goals: number;
  habit_success_rate: number;
  lessons_learned: string[];
  wins: string[];
  obstacles: string[];
  created_at: string;
  updated_at: string;
};

const toReviewPayload = (row: WeeklyReviewRow): WeeklyReviewPayload => ({
  weekStart: row.week_start,
  userId: row.user_id,
  completedGoals: row.completed_goals,
  totalGoals: row.total_goals,
  habitSuccessRate: row.habit_success_rate,
  lessonsLearned: row.lessons_learned,
  wins: row.wins,
  obstacles: row.obstacles
});

export const getWeeklyReviewByWeek = async (
  userId: string,
  weekStart: string
): Promise<WeeklyReviewPayload | null> => {
  const { rows } = await query<WeeklyReviewRow>(
    `
      SELECT *
      FROM weekly_reviews
      WHERE user_id = $1 AND week_start = $2
      LIMIT 1
    `,
    [userId, weekStart]
  );

  if (!rows.length) {
    return null;
  }

  return toReviewPayload(rows[0]);
};

export const listWeeklyReviews = async (userId: string): Promise<WeeklyReviewPayload[]> => {
  const { rows } = await query<WeeklyReviewRow>(
    `
      SELECT *
      FROM weekly_reviews
      WHERE user_id = $1
      ORDER BY week_start DESC
    `,
    [userId]
  );

  return rows.map(toReviewPayload);
};
