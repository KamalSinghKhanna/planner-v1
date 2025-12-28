import { NextRequest, NextResponse } from "next/server";
import {
  aggregateProgressByGoal,
  loadGoalProgress,
  loadGoalsOverview
} from "../../../../../modules/goals/goal.service";
import { createHabitDefinition, updateGoalById } from "../../../../../modules/goals/goal.repo";

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

export async function GET(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const daysParam = Number(req.nextUrl.searchParams.get("days") ?? "7");
    if (Number.isNaN(daysParam) || daysParam <= 0) {
      return errorResponse("Invalid `days` parameter", 422);
    }

    const overview = await loadGoalsOverview(userId);
    const history = await loadGoalProgress(userId, { days: daysParam });
    const progressByGoal = aggregateProgressByGoal(history);

    return NextResponse.json({
      overview,
      history,
      progressByGoal
    });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unauthorized") ? 401 : 500;
      return errorResponse(error.message, status);
    }

    return errorResponse("Unexpected error", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const payload = await req.json();
    if (!payload || payload.type !== "habit") {
      return errorResponse("Unsupported payload", 422);
    }

    const title = (payload.title || payload.name || "").trim();
    if (!title) {
      return errorResponse("Habit name is required", 422);
    }

    const habit = await createHabitDefinition({
      userId,
      title,
      description: payload.description,
      category: payload.category,
      cadence: payload.cadence,
      isActive: payload.is_active,
      priority: payload.priority
    });

    return NextResponse.json({ habit }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unauthorized") ? 401 : 500;
      return errorResponse(error.message, status);
    }
    return errorResponse("Unexpected error", 500);
  }
}
