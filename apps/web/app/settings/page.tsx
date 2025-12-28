"use client";

import { useEffect, useMemo, useState } from "react";

type HabitCategory = "career" | "product" | "health" | "communication";
type HabitCadence = "daily" | "weekday" | "weekend";

type Habit = {
  id: string;
  name: string;
  category: HabitCategory;
  cadence: HabitCadence;
  is_active: boolean;
};

type HabitForm = {
  name: string;
  category: HabitCategory;
  cadence: HabitCadence;
  is_active: boolean;
};

type Preferences = {
  timezone: string;
  availableHoursPerDay: string;
  aiEnabled: boolean;
};

const habitCategories: HabitCategory[] = ["career", "product", "health", "communication"];
const habitCadences: HabitCadence[] = ["daily", "weekday", "weekend"];
const PREFERENCES_KEY = "planner_v3_preferences";

const defaultTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
const DEFAULT_USER_ID =
  process.env.NEXT_PUBLIC_DEMO_USER_ID ??
  "00000000-0000-0000-0000-000000000001";
const AUTH_HEADERS = {
  Authorization: `Bearer ${DEFAULT_USER_ID}`
};

const initialHabitForm: HabitForm = {
  name: "",
  category: "career",
  cadence: "daily",
  is_active: true
};

export default function SettingsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [habitsError, setHabitsError] = useState<string | null>(null);
  const [newHabit, setNewHabit] = useState<HabitForm>(initialHabitForm);
  const [newHabitError, setNewHabitError] = useState<string | null>(null);
  const [submittingHabit, setSubmittingHabit] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editingHabit, setEditingHabit] = useState<HabitForm | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  const [preferences, setPreferences] = useState<Preferences>({
    timezone: defaultTimezone,
    availableHoursPerDay: "",
    aiEnabled: false
  });
  const [prefsSaved, setPrefsSaved] = useState(false);

  const activeHabitCount = useMemo(() => habits.filter((habit) => habit.is_active).length, [habits]);

  useEffect(() => {
    let isMounted = true;
    setLoadingHabits(true);
    fetch("/api/goals", { headers: AUTH_HEADERS })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Unable to load habits");
        }
        const payload = await res.json();
        const fetchedHabits: Habit[] = payload.habits ?? [];
        if (isMounted) {
          setHabits(fetchedHabits);
          setHabitsError(null);
        }
      })
      .catch((error) => {
        if (isMounted) {
          setHabitsError(error instanceof Error ? error.message : "Failed to load habits");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingHabits(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      try {
        const parsed: Preferences = JSON.parse(stored);
        setPreferences(parsed);
      } catch {
        // ignore invalid stored values
      }
    }
  }, []);

  /**
   * Settings endpoint does not exist yet, so persist preferences client-side only.
   */
  const persistPreferences = (next: Preferences) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(next));
    setPreferences(next);
    setPrefsSaved(true);
    setTimeout(() => setPrefsSaved(false), 1200);
  };

  const handleNewHabit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newHabit.name.trim()) {
      setNewHabitError("Habit name is required.");
      return;
    }

    setNewHabitError(null);
    setSubmittingHabit(true);

    try {
      const response = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...AUTH_HEADERS },
        body: JSON.stringify({ type: "habit", ...newHabit })
      });

      if (!response.ok) {
        throw new Error("Unable to add habit");
      }

      await refreshHabits();
      setNewHabit(initialHabitForm);
    } catch (error) {
      setNewHabitError(error instanceof Error ? error.message : "Failed to save habit");
    } finally {
      setSubmittingHabit(false);
    }
  };

  const handleEditHabit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingHabit || !editingHabit.name.trim() || !editingHabitId) {
      setEditError("Habit name is required.");
      return;
    }

    setEditError(null);

    try {
      const response = await fetch(`/api/goals/${editingHabitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...AUTH_HEADERS },
        body: JSON.stringify(editingHabit)
      });

      if (!response.ok) {
        throw new Error("Unable to update habit");
      }

      await refreshHabits();
      setEditingHabitId(null);
      setEditingHabit(null);
    } catch (error) {
      setEditError(error instanceof Error ? error.message : "Failed to update habit");
    }
  };

  const refreshHabits = async () => {
    setLoadingHabits(true);
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) {
        throw new Error("Unable to refresh habits");
      }
      const payload = await res.json();
      setHabits(payload.habits ?? []);
      setHabitsError(null);
    } catch (error) {
      setHabitsError(error instanceof Error ? error.message : "Failed to refresh habits");
    } finally {
      setLoadingHabits(false);
    }
  };

  const toggleHabitActive = async (habit: Habit) => {
    try {
      const response = await fetch(`/api/goals/${habit.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...AUTH_HEADERS },
        body: JSON.stringify({ is_active: !habit.is_active })
      });

      if (!response.ok) {
        throw new Error("Unable to update habit");
      }

      await refreshHabits();
    } catch (error) {
      setHabitsError(error instanceof Error ? error.message : "Failed to update habit");
    }
  };

  const startEdit = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditingHabit({
      name: habit.name,
      category: habit.category,
      cadence: habit.cadence,
      is_active: habit.is_active
    });
    setEditError(null);
  };

  const handlePreferencesSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    persistPreferences(preferences);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-black px-4 py-10 text-white sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.5em] text-indigo-200">Daily habits</p>
              <h1 className="text-2xl font-semibold text-white">Habit minimums</h1>
            </div>
            <p className="text-xs text-neutral-400">
              Active habits: {activeHabitCount}/4 {activeHabitCount > 4 && "(soft limit reached)"}
            </p>
          </div>

          <form
            className="grid gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 md:grid-cols-2"
            onSubmit={handleNewHabit}
          >
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-neutral-400">Name</label>
              <input
                value={newHabit.name}
                onChange={(event) =>
                  setNewHabit((prev) => ({ ...prev, name: event.target.value }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                placeholder="Morning pages"
                required
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-neutral-400">Category</label>
              <select
                value={newHabit.category}
                onChange={(event) =>
                  setNewHabit((prev) => ({
                    ...prev,
                    category: event.target.value as HabitCategory
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
              >
                {habitCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-neutral-400">Cadence</label>
              <select
                value={newHabit.cadence}
                onChange={(event) =>
                  setNewHabit((prev) => ({
                    ...prev,
                    cadence: event.target.value as HabitCadence
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
              >
                {habitCadences.map((cadence) => (
                  <option key={cadence} value={cadence}>
                    {cadence}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end justify-between">
              <label className="text-xs uppercase tracking-[0.4em] text-neutral-400">Active</label>
              <input
                type="checkbox"
                checked={newHabit.is_active}
                onChange={(event) =>
                  setNewHabit((prev) => ({ ...prev, is_active: event.target.checked }))
                }
                className="h-5 w-5 rounded border border-white/30 bg-transparent text-indigo-500 focus:ring-0"
              />
            </div>
            {newHabitError && (
              <p className="col-span-full text-xs text-rose-400">{newHabitError}</p>
            )}
            <div className="col-span-full flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={submittingHabit}
                className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {submittingHabit ? "Saving…" : "Add habit"}
              </button>
            </div>
          </form>

          <div className="mt-8 space-y-4">
            {loadingHabits && <p className="text-sm text-neutral-400">Loading habits…</p>}
            {habitsError && <p className="text-sm text-rose-400">{habitsError}</p>}
            {!loadingHabits && !habits.length && (
              <p className="text-sm text-neutral-500">No habits defined yet.</p>
            )}
            {habits.map((habit) => (
              <div
                key={habit.id}
                className="rounded-2xl border border-white/5 bg-white/5 p-4 shadow-[0_20px_45px_rgba(0,0,0,0.25)]"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">{habit.name}</p>
                    <p className="text-xs uppercase tracking-[0.4em] text-indigo-200">
                      {habit.category} • {habit.cadence}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => startEdit(habit)}
                      className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/90 transition hover:border-white/40"
                    >
                      Edit
                    </button>
                    <label className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-neutral-400">
                      <input
                        type="checkbox"
                        checked={habit.is_active}
                        onChange={() => toggleHabitActive(habit)}
                        className="h-4 w-4 rounded border border-white/30 bg-transparent text-indigo-500 focus:ring-0"
                      />
                      Active
                    </label>
                  </div>
                </div>
                {editingHabitId === habit.id && editingHabit && (
                  <form className="mt-4 space-y-3" onSubmit={handleEditHabit}>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-[0.6rem] uppercase tracking-[0.45em] text-neutral-400">
                          Name
                        </label>
                        <input
                          value={editingHabit.name}
                          onChange={(event) =>
                            setEditingHabit((prev) =>
                              prev ? { ...prev, name: event.target.value } : prev
                            )
                          }
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[0.6rem] uppercase tracking-[0.45em] text-neutral-400">
                          Category
                        </label>
                        <select
                          value={editingHabit.category}
                          onChange={(event) =>
                            setEditingHabit((prev) =>
                              prev
                                ? { ...prev, category: event.target.value as HabitCategory }
                                : prev
                            )
                          }
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                        >
                          {habitCategories.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div>
                        <label className="text-[0.6rem] uppercase tracking-[0.45em] text-neutral-400">
                          Cadence
                        </label>
                        <select
                          value={editingHabit.cadence}
                          onChange={(event) =>
                            setEditingHabit((prev) =>
                              prev
                                ? { ...prev, cadence: event.target.value as HabitCadence }
                                : prev
                            )
                          }
                          className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                        >
                          {habitCadences.map((cadence) => (
                            <option key={cadence} value={cadence}>
                              {cadence}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end justify-between">
                        <label className="text-[0.6rem] uppercase tracking-[0.45em] text-neutral-400">
                          Active
                        </label>
                        <input
                          type="checkbox"
                          checked={editingHabit.is_active}
                          onChange={(event) =>
                            setEditingHabit((prev) =>
                              prev ? { ...prev, is_active: event.target.checked } : prev
                            )
                          }
                          className="h-4 w-4 rounded border border-white/30 bg-transparent text-indigo-500 focus:ring-0"
                        />
                      </div>
                    </div>
                    {editError && <p className="text-xs text-rose-400">{editError}</p>}
                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white transition hover:opacity-90"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingHabitId(null)}
                        className="rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-white/70 transition hover:border-white/40"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(2,6,23,0.7)]">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.5em] text-indigo-200">Preferences</p>
            <h2 className="text-2xl font-semibold text-white">Planning defaults</h2>
          </div>
          <form className="space-y-4" onSubmit={handlePreferencesSubmit}>
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-neutral-400">Timezone</label>
              <input
                value={preferences.timezone}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, timezone: event.target.value }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
              />
              <p className="text-xs text-neutral-500">
                Defaults to your browser timezone when first visiting.
              </p>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.4em] text-neutral-400">
                Available hours / day
              </label>
              <input
                type="number"
                min={0}
                value={preferences.availableHoursPerDay}
                onChange={(event) =>
                  setPreferences((prev) => ({
                    ...prev,
                    availableHoursPerDay: event.target.value
                  }))
                }
                className="mt-1 w-full rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition focus:border-indigo-500"
                placeholder="Optional"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                id="ai-enabled"
                type="checkbox"
                checked={preferences.aiEnabled}
                onChange={(event) =>
                  setPreferences((prev) => ({ ...prev, aiEnabled: event.target.checked }))
                }
                className="h-4 w-4 rounded border border-white/30 bg-transparent text-indigo-500 focus:ring-0"
              />
              <label htmlFor="ai-enabled" className="text-sm text-neutral-200">
                Enable AI-assisted planning (managed locally; no backend yet)
              </label>
            </div>
            <div className="flex items-center justify-end gap-3">
              {prefsSaved && (
                <p className="text-xs text-emerald-300">Preferences saved locally</p>
              )}
              <button
                type="submit"
                className="rounded-full border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-[0.4em] text-white/90 transition hover:border-white/40"
              >
                Save preferences
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
