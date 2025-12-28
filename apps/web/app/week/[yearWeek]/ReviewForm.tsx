"use client";

import { useEffect, useState } from "react";

import type {
  WeeklyReviewPayload,
  WeeklyReviewSummary
} from "../../../../modules/review/review.types";

type ReviewResponse = {
  payload: WeeklyReviewPayload;
  summary: WeeklyReviewSummary;
};

type Props = {
  weekStart: string;
};

const API_BASE = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "demo-user";

const fetchReview = async (weekStart: string): Promise<ReviewResponse> => {
  const response = await fetch(`${API_BASE}/api/week/review?weekStart=${weekStart}`, {
    headers: {
      Authorization: `Bearer ${DEMO_USER_ID}`
    },
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error("Unable to load weekly review");
  }

  return response.json();
};

export default function ReviewForm({ weekStart }: Props) {
  const [review, setReview] = useState<ReviewResponse | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchReview(weekStart)
      .then((data) => {
        if (isMounted) {
          setReview(data);
          setDraft(data.payload.lessonsLearned.join(" "));
          setError(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load review");
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [weekStart]);

  if (loading) {
    return <p className="text-sm text-neutral-400">Loading review…</p>;
  }

  if (error || !review) {
    return <p className="text-sm text-red-400">{error ?? "Unable to load review."}</p>;
  }

  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900/30 p-6 space-y-4 text-sm text-neutral-300">
      <p className="text-xs uppercase tracking-[0.4em] text-neutral-500">Weekly Review</p>
      <div className="space-y-2">
        <p className="font-semibold text-neutral-100">Wins</p>
        <ul className="list-disc pl-6">
          {review.payload.wins.map((win, index) => (
            <li key={`win-${index}`}>{win}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-neutral-100">Obstacles</p>
        <ul className="list-disc pl-6 text-amber-200">
          {review.payload.obstacles.map((obstacle, index) => (
            <li key={`obstacle-${index}`}>{obstacle}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-neutral-100">Summary</p>
        <p className="text-neutral-500">{review.summary.focus}</p>
        <p className="text-xs uppercase tracking-[0.3em] text-neutral-400">Adjustments</p>
        <ul className="list-disc pl-6">
          {review.summary.adjustments.map((adjustment, index) => (
            <li key={`adjust-${index}`}>{adjustment}</li>
          ))}
        </ul>
      </div>
      <div className="space-y-2">
        <p className="font-semibold text-neutral-100">Draft Notes</p>
        <textarea
          className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/50 p-3 text-sm text-neutral-100 outline-none focus:border-neutral-600"
          rows={4}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-full border border-emerald-500 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300 transition hover:bg-emerald-500/10"
        >
          Save reflection
        </button>
      </div>
    </section>
  );
}
