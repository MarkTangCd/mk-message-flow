import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { MessageWithDetails } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await query<MessageWithDetails>(
      `SELECT 
        m.id, m.scheduled_task_id, m.task_execution_id, m.content, m.content_format,
        m.title, m.summary, m.execution_completion_time, m.is_read, m.read_at,
        m.is_favorite, m.favorited_at, m.priority, m.created_at,
        st.name as task_name, st.schedule_type, st.execution_hour, st.execution_minute, st.prompt_content,
        am.company_name as ai_model_company, am.model_name as ai_model_name
       FROM messages m
       JOIN scheduled_tasks st ON m.scheduled_task_id = st.id
       JOIN ai_models am ON st.ai_model_id = am.id
       WHERE m.is_favorite = TRUE
       ORDER BY m.favorited_at DESC NULLS LAST
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch favorites" },
      { status: 500 }
    );
  }
}
