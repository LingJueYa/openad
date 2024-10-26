import { NextRequest, NextResponse } from "next/server";
import { getTaskStatus } from "@/utils/queue";

export async function GET(req: NextRequest) {
  const taskId = req.nextUrl.searchParams.get("taskId");

  if (!taskId) {
    return NextResponse.json({ error: "Missing taskId" }, { status: 400 });
  }

  const status = await getTaskStatus(taskId);

  if (!status) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ status });
}
