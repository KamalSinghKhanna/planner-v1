import { NextRequest, NextResponse } from "next/server";
import { updateGoalById } from "../../../../../modules/goals/goal.repo";
import type { GoalUpdateArgs } from "../../../../../modules/goals/goal.repo";

const DEMO_USER_ID = process.env.NEXT_PUBLIC_DEMO_USER_ID ?? "00000000-0000-0000-0000-000000000001";

const resolveUserId = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  if (authHeader?.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      return token;
    }
  }

  const fallback = req.headers.get("x-user-id");
  if (fallback) {
    return fallback;
  }

  return DEMO_USER_ID;
};

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = resolveUserId(req);
    const body = await req.json();
    const updates = {
      title: body.title,
      description: body.description ?? null,
      priority: body.priority,
      isActive: body.is_active,
      isCompleted: body.is_completed,
      category: body.category,
      cadence: body.cadence
    };

    const sanitizedEntries = Object.entries(updates).filter(([, value]) => value !== undefined);

    if (!sanitizedEntries.length) {
      return errorResponse("No fields to update", 422);
    }

    const sanitizedUpdates: GoalUpdateArgs = Object.fromEntries(sanitizedEntries);

    const updated = await updateGoalById(userId, params.id, sanitizedUpdates);
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unable to find goal") ? 404 : 500;
      return errorResponse(error.message, status);
    }
    return errorResponse("Unexpected error", 500);
  }
}
