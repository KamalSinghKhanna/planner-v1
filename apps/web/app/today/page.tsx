"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import DailyChecklist from "./components/DailyChecklist";
import ProgressBar from "./components/ProgressBar";
import type { HabitItemData } from "./components/HabitItem";

type DayChecklist = {
  logDate: string;
  userId: string;
  summary: string | null;
  habits: HabitItemData[];
};

const API_ENDPOINT = "/api/today";
const DEFAULT_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";

const fetchChecklist = async (): Promise<DayChecklist> => {
  const response = await fetch(API_ENDPOINT, {
    headers: {
      "x-user-id": DEFAULT_USER_ID,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to fetch today's checklist");
  }

  return response.json();
};

const toggleHabit = async (habitName: string): Promise<DayChecklist> => {
  const response = await fetch(API_ENDPOINT, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-user-id": DEFAULT_USER_ID,
      Accept: "application/json"
    },
    body: JSON.stringify({ habitName })
  });

  if (!response.ok) {
    throw new Error("Unable to toggle habit completion");
  }

  return response.json();
};

export default function TodayPage() {
  const [checklist, setChecklist] = useState<DayChecklist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const loadChecklist = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchChecklist();
      setChecklist(data);
      setError(null);
    } catch (caught) {
      if (caught instanceof Error) {
        setError(caught.message);
      } else {
        setError("Unexpected error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  const habitSummary = useMemo(() => {
    if (!checklist) {
      return { completed: 0, total: 0 };
    }

    const total = checklist.habits.length;
    const completed = checklist.habits.filter((habit) => habit.completed).length;
    return { completed, total };
  }, [checklist]);

  const handleToggle = useCallback(
    async (habitName: string) => {
      try {
        setToggling(habitName);
        const refreshed = await toggleHabit(habitName);
        setChecklist(refreshed);
        setError(null);
      } catch (caught) {
        if (caught instanceof Error) {
          setError(caught.message);
        } else {
          setError("Unexpected error");
        }
      } finally {
        setToggling(null);
      }
    },
    []
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 pb-16 pt-10 text-white sm:px-6 lg:px-12">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="rounded-[32px] border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 p-10 shadow-[0_30px_100px_rgba(2,6,23,0.6)]">
          <div className="flex flex-col gap-2 text-white/80">
            <p className="text-xs uppercase tracking-[0.5em] text-indigo-200">Planner v3</p>
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">Today’s Execution</h1>
            <p className="text-sm text-white/70">
              {checklist ? `Logged for ${checklist.logDate}` : "Fetching today’s checklist..."}
            </p>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="space-y-4 rounded-2xl border border-white/5 bg-white/5 p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.6em] text-neutral-400">Habits</p>
                <button
                  onClick={loadChecklist}
                  className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
                >
                  Refresh
                </button>
              </div>
              <ProgressBar
                progress={habitSummary.total === 0 ? 0 : habitSummary.completed / habitSummary.total}
                label={`${habitSummary.completed} / ${habitSummary.total} done`}
              />
              <p className="text-sm text-neutral-400">
                {habitSummary.total === 0
                  ? "Add habits in your planner to start tracking."
                  : `${habitSummary.completed} habits complete today.`}
              </p>
            </div>
            <div className="space-y-4 rounded-2xl border border-white/5 bg-gradient-to-b from-indigo-500/20 to-indigo-500/5 p-5">
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Motivation</p>
              <p className="text-base font-medium text-white/90">
                Stay curious, stay consistent. Every check mark is a pulse of execution, not perfection.
              </p>
              <p className="text-xs uppercase tracking-[0.4em] text-indigo-300">Tip</p>
              <p className="text-sm text-indigo-100/80">
                Pause 30 seconds before starting each habit to visualize completion.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_25px_70px_rgba(15,23,42,0.55)]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Checklist</h2>
            <p className="text-sm text-neutral-400">{loading ? "Synchronizing…" : error ? "Action required" : "Live sync"}</p>
          </div>
          <div className="mt-4 space-y-4">
            {loading && <p className="text-sm text-neutral-500">Loading...</p>}
            {error && <p className="text-sm text-rose-400">{error}</p>}
            {!loading && !error && checklist && (
              <DailyChecklist habits={checklist.habits} toggling={toggling} onToggle={handleToggle} />
            )}
            {!loading && !error && checklist?.habits.length === 0 && (
              <p className="text-sm text-neutral-500">Add a habit from your planner to see it here.</p>
            )}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8">
          <p className="text-sm text-neutral-400">
            This UI connects directly with `/api/today`, so every toggle writes back to the execution core and
            keeps PostgreSQL as the single source of truth.
          </p>
        </section>
      </div>
    </main>
  );
}
