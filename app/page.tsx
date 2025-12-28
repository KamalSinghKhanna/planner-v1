"use client";

import Link from "next/link";

const highlights = [
  "Daily execution is the source of truth.",
  "Plans never overwrite historical logs.",
  "AI only summarizes, never mutates core data."
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-[#010409] via-[#020617] to-black px-6 py-12 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="space-y-3 rounded-[32px] border border-white/10 bg-white/5 p-10 shadow-[0_20px_120px_rgba(15,23,42,0.5)]">
          <p className="text-xs uppercase tracking-[0.6em] text-indigo-200">Planner v3</p>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Build bold weekly plans that sync with today’s execution data.
          </h1>
          <p className="max-w-2xl text-lg text-white/70">
            The modular monolith keeps goals, habits, and AI prompts in lockstep with PostgreSQL as the source of truth.
            No microservices, no agents with memory—just clean services and trustworthy outputs.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/today"
              className="rounded-full bg-gradient-to-r from-indigo-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white shadow-lg shadow-fuchsia-500/40 transition hover:scale-[1.01] hover:shadow-fuchsia-600/60"
            >
              Today’s checklist
            </Link>
            <Link
              href="/week/2025-W01"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold uppercase tracking-[0.4em] text-white/80 transition hover:border-white/40 hover:text-white"
            >
              Weekly planning
            </Link>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {highlights.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_45px_rgba(2,6,23,0.35)]">
              <p className="text-sm text-indigo-200">Guiding principle</p>
              <p className="mt-4 text-base font-medium leading-relaxed text-white/90">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
