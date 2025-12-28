"use client";

import { useEffect, useMemo, useState } from "react";

import PlanView from "./PlanView";
import ReviewForm from "./ReviewForm";
import type { WeeklyPlanInput } from "../../../../modules/planning/planning.types";

type Props = {
  params: {
    yearWeek: string;
  };
};

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";

const isoWeekToDate = (isoWeek: string): string => {
  const [yearPart, weekPart] = isoWeek.split("-W");
  const year = Number(yearPart);
  const week = Number(weekPart);
  const firstOfYear = new Date(year, 0, 1);
  const firstWeekDay = firstOfYear.getDay();
  const dayOffset = (week - 1) * 7 - ((firstWeekDay + 6) % 7);
  const monday = new Date(firstOfYear);
  monday.setDate(firstOfYear.getDate() + dayOffset);
  return monday.toISOString().split("T")[0];
};

const fetchPlan = async (yearWeek: string): Promise<WeeklyPlanInput> => {
  const weekStart = isoWeekToDate(yearWeek);
  const response = await fetch(`${API_BASE}/api/week?weekStart=${weekStart}&hoursPerDay=3`, {
    headers: {
      Authorization: `Bearer ${DEMO_USER_ID}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to fetch weekly plan");
  }

  return response.json();
};

export default function WeekPage({ params }: Props) {
  const [plan, setPlan] = useState<WeeklyPlanInput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    fetchPlan(params.yearWeek)
      .then((data) => {
        if (mounted) {
          setPlan(data);
          setError(null);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [params.yearWeek]);

  const weekLabel = useMemo(() => {
    const [yearPart, weekPart] = params.yearWeek.split("-W");
    return `${yearPart} · Week ${weekPart}`;
  }, [params.yearWeek]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-12 text-white sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="space-y-2 text-white/70">
          <p className="text-xs uppercase tracking-[0.5em] text-indigo-300">Weekly review</p>
          <h1 className="text-3xl font-semibold text-white">Weekly plan · {weekLabel}</h1>
          <p className="text-sm text-neutral-400">
            This view is powered by `/api/week`, which composes goals, habits, and availability into a single
            plan context.
          </p>
        </header>

        {loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-sm text-neutral-400">
            Loading weekly plan…
          </div>
        )}

        {error && (
          <div className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-8 text-base text-rose-100">
            {error}
          </div>
        )}

        {plan && !error && (
          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <PlanView plan={plan} weekLabel={weekLabel} />
            <ReviewForm weekStart={plan.weekStart} />
          </div>
        )}
      </div>
    </main>
  );
}
