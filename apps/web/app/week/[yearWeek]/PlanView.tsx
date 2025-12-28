"use client";

import type { WeeklyPlanInput } from "../../../../modules/planning/planning.types";

type Props = {
  plan: WeeklyPlanInput;
  weekLabel: string;
};

const weekRangeLabel = (weekStart: string) => {
  const date = new Date(weekStart);
  const end = new Date(date);
  end.setDate(date.getDate() + 6);
  return `${date.toLocaleDateString()} – ${end.toLocaleDateString()}`;
};

export default function PlanView({ plan, weekLabel }: Props) {
  const completedGoals = plan.goals.filter((goal) => goal.isCompleted);
  return (
    <section className="space-y-8">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.5em] text-neutral-500">Weekly planning</p>
        <h1 className="text-3xl font-semibold text-neutral-100">{weekLabel}</h1>
        <p className="text-sm text-neutral-400">
          {weekRangeLabel(plan.weekStart)} · {plan.availableDays.length} days of availability
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Goals</p>
          <p className="mt-2 text-lg font-semibold text-neutral-100">
            {plan.goals.length} total · {completedGoals.length} complete
          </p>
          <ul className="mt-4 space-y-2 text-sm text-neutral-300">
            {plan.goals.map((goal) => (
              <li key={goal.id} className="flex items-center justify-between">
                <span className="truncate">{goal.title}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    goal.isCompleted ? "bg-emerald-500/20 text-emerald-200" : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {goal.isCompleted ? "Done" : goal.isActive ? "Active" : "On hold"}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Availability</p>
          <div className="mt-3 space-y-2 text-sm text-neutral-300">
            {plan.availableDays.map((day) => (
              <div key={day.date} className="flex items-center justify-between">
                <span>{new Date(day.date).toLocaleDateString(undefined, { weekday: "short" })}</span>
                <span className="font-semibold text-neutral-100">{day.availableHours} hrs</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-4">
          <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Habit focus</p>
          <ul className="mt-3 space-y-3 text-sm text-neutral-300">
            {plan.habitSnapshots.map((snapshot) => (
              <li key={snapshot.name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-100">{snapshot.name}</span>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-500">
                    {Math.round(snapshot.completionRate * 100)}%
                  </span>
                </div>
                <p className="text-xs text-neutral-500">
                  Streak {snapshot.currentStreak} · Last done {snapshot.lastCompletedAt ?? "N/A"}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/30 p-6 text-sm text-neutral-300">
        <p>
          This overview is generated from the execution data in `daily_logs`, the goals stored in your planner,
          and the habit snapshots built from the habit completion history.
        </p>
      </div>
    </section>
  );
}
