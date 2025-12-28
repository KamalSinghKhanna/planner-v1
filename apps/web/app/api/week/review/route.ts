import { NextRequest, NextResponse } from "next/server";
import {
  buildWeeklyReviewPayload,
  summarizeWeeklyReview
} from "../../../../../../modules/review/review.service";

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

export async function GET(req: NextRequest) {
  try {
    const userId = resolveUserId(req);
    const { weekStart } = Object.fromEntries(req.nextUrl.searchParams.entries());
    if (!weekStart) {
      return errorResponse("weekStart query param is required", 422);
    }

    const payload = await buildWeeklyReviewPayload(userId, { weekStart });
    const summary = summarizeWeeklyReview(payload);

    return NextResponse.json({ payload, summary });
  } catch (error) {
    if (error instanceof Error) {
      const status = error.message.startsWith("Unauthorized") ? 401 : 422;
      return errorResponse(error.message, status);
    }

    return errorResponse("Unexpected error", 500);
  }
}
