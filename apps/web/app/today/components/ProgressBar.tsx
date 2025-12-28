"use client";

type Props = {
  progress: number;
  label?: string;
};

export default function ProgressBar({ progress, label }: Props) {
  const safeProgress = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(safeProgress * 100);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">{label}</p>
      )}
      <div className="h-2 rounded-full bg-neutral-900">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className="text-xs text-neutral-500">{percent}% complete</p>
    </div>
  );
}
