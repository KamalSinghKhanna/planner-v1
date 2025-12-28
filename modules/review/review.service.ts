import { WeeklyReviewPayload, WeeklyReviewSummary } from "./review.types";
import { getWeeklyReviewByWeek, listWeeklyReviews } from "./review.repo";
import { loadGoalsOverview, loadGoalProgress } from "../goals/goal.service";

type ReviewOptions = {
  weekStart: string;
  goalHistoryDays?: number;
};

const clampRate = (value: number): number => Math.max(0, Math.min(1, value));

const buildNarratives = (
  totalGoals: number,
  completedGoals: number,
  habitSuccessRate: number
): {
  wins: string[];
  lessons: string[];
  obstacles: string[];
} => {
  const wins: string[] = [];
  const lessons: string[] = [];
  const obstacles: string[] = [];
  const completionRate = totalGoals === 0 ? 0 : completedGoals / totalGoals;

  if (totalGoals === 0) {
    lessons.push("Define at least one meaningful goal before next week.");
  } else {
    if (completionRate >= 0.8) {
      wins.push(`Delivered ${completedGoals}/${totalGoals} goals (${Math.round(completionRate * 100)}%).`);
    } else {
      lessons.push(
        "Re-align the priority list so each goal has dedicated time and energy."
      );
    }
  }

  if (habitSuccessRate >= 0.75) {
    wins.push("Kept habit streaks consistent throughout the week.");
  } else {
    obstacles.push("Schedule habits before meetings to guard them.");
  }

  if (!wins.length) {
    wins.push("Moved the needle despite constraints on the week.");
  }

  if (!obstacles.length) {
    obstacles.push("Remember to protect calm focus blocks for deep work.");
  }

  if (!lessons.length) {
    lessons.push("Keep iterating on how rituals support bigger priorities.");
  }

  return { wins, lessons, obstacles };
};

export const buildWeeklyReviewPayload = async (
  userId: string,
  options: ReviewOptions
): Promise<WeeklyReviewPayload> => {
  const cached = await getWeeklyReviewByWeek(userId, options.weekStart);
  if (cached) {
    return cached;
  }

  const historyDays = options.goalHistoryDays ?? 7;
  const [overview, history] = await Promise.all([
    loadGoalsOverview(userId),
    loadGoalProgress(userId, { days: historyDays })
  ]);

  const completedGoals = overview.summary.completed;
  const totalGoals = overview.summary.totalGoals;
  const goalRate = totalGoals === 0 ? 0 : completedGoals / totalGoals;
  const habitSuccessRate =
    history.length === 0 ? 0 : history.filter((point) => point.completed).length / history.length;

  const narrative = buildNarratives(totalGoals, completedGoals, habitSuccessRate);

  return {
    weekStart: options.weekStart,
    userId,
    completedGoals,
    totalGoals,
    habitSuccessRate: clampRate(habitSuccessRate),
    lessonsLearned: narrative.lessons,
    wins: narrative.wins,
    obstacles: narrative.obstacles
  };
};

export const summarizeWeeklyReview = (payload: WeeklyReviewPayload): WeeklyReviewSummary => {
  const focus =
    payload.completedGoals === payload.totalGoals
      ? "Keep repeating what worked this week."
      : "Double down on the top priorities that slipped.";

  const adjustments = [
    ...(payload.obstacles.length ? payload.obstacles : ["Take stock of your energy before the next sprint."]),
    ...(payload.lessonsLearned.length ? payload.lessonsLearned : [])
  ];

  const affirmation = `You wrapped ${payload.completedGoals}/${payload.totalGoals} goals and maintained ${Math.round(
    payload.habitSuccessRate * 100
  )}% habit consistency.`;

  return {
    focus,
    adjustments,
    affirmation
  };
};

export const listReviews = (userId: string) => listWeeklyReviews(userId);
