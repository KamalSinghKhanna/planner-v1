import { NextRequest, NextResponse } from "next/server";
import {
  getTodayChecklist,
  toggleHabitCompletion
} from "../../../../../modules/execution/day-log.service";

const resolveUserId = (req: NextRequest): string => {
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

  throw new Error("Unauthorized: missing user identifier");
};

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function GET(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const checklist = await getTodayChecklist(userId);
    return NextResponse.json(checklist);
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unauthorized") ? 401 : 500;
      return errorResponse(error.message, status);
    }

    return errorResponse("Unexpected error", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const body = await req.json();
    const habitName = String(body.habitName ?? "").trim();
    if (!habitName) {
      return errorResponse("habitName is required", 422);
    }

    const updatedLog = await toggleHabitCompletion({
      userId,
      habitName,
      day: body.day,
      completed: body.completed,
      notes: body.notes
    });

    return NextResponse.json(updatedLog);
  } catch (error) {
    if (error instanceof Error) {
      const status =
        error.message.startsWith("Unauthorized") || error.message === "habitName is required"
          ? 401
          : 500;
      return errorResponse(error.message, status);
    }

    return errorResponse("Unexpected error", 500);
  }
}
