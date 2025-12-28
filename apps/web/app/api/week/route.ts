import { NextRequest, NextResponse } from "next/server";
import { buildWeeklyPlanInput } from "../../../../../modules/planning/weekly-plan.service";

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

  throw new Error("Unauthorized: missing user identifier");
};

const errorResponse = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

const parseNumberParam = (value: string | null, fallback: number): number => {
  if (value === null) {
    return fallback;
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error("Invalid numeric query parameter");
  }
  return parsed;
};

export async function GET(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const { searchParams } = req.nextUrl;
    const weekStart = searchParams.get("weekStart") ?? undefined;
    const availableHoursPerDay = parseNumberParam(searchParams.get("hoursPerDay"), 2);
    const historyDays = parseNumberParam(searchParams.get("historyDays"), 7);
    const habitNames = searchParams.getAll("habit");

    const planInput = await buildWeeklyPlanInput(userId, {
      weekStart,
      availableHoursPerDay,
      historyDays,
      habitNames: habitNames.length ? habitNames : undefined
    });

    return NextResponse.json(planInput);
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unauthorized") ? 401 : 422;
      return errorResponse(error.message, status);
    }

    return errorResponse("Unexpected error", 500);
  }
}
