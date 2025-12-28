"use client";

export type HabitItemData = {
  name: string;
  completed: boolean;
  notes: string | null;
};

type Props = {
  habit: HabitItemData;
  toggling: string | null;
  onToggle: (habitName: string) => void;
};

export default function HabitItem({ habit, toggling, onToggle }: Props) {
  const isUpdating = toggling === habit.name;
  const isDisabled = Boolean(toggling && toggling !== habit.name);

  return (
    <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-neutral-950/50 px-4 py-3 transition hover:border-neutral-600">
      <div>
        <p className="text-base font-medium">{habit.name}</p>
        {habit.notes && (
          <p className="text-xs text-neutral-500">{habit.notes}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onToggle(habit.name)}
        disabled={isDisabled}
        className={`rounded-full px-4 py-1 text-sm font-semibold transition ${
          habit.completed
            ? "border border-emerald-500 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
            : "border border-neutral-700 text-neutral-300 hover:border-neutral-500"
        }`}
      >
        {isUpdating ? "Updating…" : habit.completed ? "Done" : "Mark done"}
      </button>
    </div>
  );
}
