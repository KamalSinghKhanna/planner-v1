export type WeeklyReviewInsight = {
  theme: string;
  detail: string;
};

export type WeeklyReviewPayload = {
  weekStart: string;
  userId: string;
  completedGoals: number;
  totalGoals: number;
  habitSuccessRate: number;
  lessonsLearned: string[];
  wins: string[];
  obstacles: string[];
};

export type WeeklyReviewSummary = {
  focus: string;
  adjustments: string[];
  affirmation: string;
};
