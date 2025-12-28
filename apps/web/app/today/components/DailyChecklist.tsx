"use client";

import HabitItem, {
  type HabitItemData
} from "./HabitItem";

type Props = {
  habits: HabitItemData[];
  toggling: string | null;
  onToggle: (habitName: string) => void;
};

export default function DailyChecklist({ habits, toggling, onToggle }: Props) {
  if (!habits.length) {
    return (
      <p className="text-sm text-neutral-500">
        Add a habit from your planner to see it here.
      </p>
    );
  }

  return (
    <div className="mt-6 space-y-3">
          {habits.map((habit) => (
            <HabitItem key={habit.name} habit={habit} toggling={toggling} onToggle={onToggle} />
          ))}
        </div>
  );
}
