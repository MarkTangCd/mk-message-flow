import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Message, MessageWithDetails, CreateMessageInput } from "@/lib/types";

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const isRead = searchParams.get("isRead");
    const isFavorite = searchParams.get("isFavorite");
    const taskId = searchParams.get("taskId");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const whereConditions: string[] = [];
    const values: (string | number | boolean)[] = [];
    let paramIndex = 1;

    if (isRead !== null) {
      whereConditions.push(`m.is_read = $${paramIndex++}`);
      values.push(isRead === "true");
    }

    if (isFavorite !== null) {
      whereConditions.push(`m.is_favorite = $${paramIndex++}`);
      values.push(isFavorite === "true");
    }

    if (taskId !== null) {
      whereConditions.push(`m.scheduled_task_id = $${paramIndex++}`);
      values.push(parseInt(taskId));
    }

    const whereClause = whereConditions.length > 0 
      ? `WHERE ${whereConditions.join(" AND ")}` 
      : "";

    values.push(limit);
    values.push(offset);

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
       ${whereClause}
       ORDER BY m.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      values
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateMessageInput = await request.json();

    if (!body.scheduled_task_id || !body.task_execution_id || !body.content || !body.execution_completion_time) {
      return NextResponse.json(
        { success: false, error: "Task ID, execution ID, content, and completion time are required" },
        { status: 400 }
      );
    }

    const result = await query<Message>(
      `INSERT INTO messages (
        scheduled_task_id, task_execution_id, content, content_format,
        title, summary, execution_completion_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        body.scheduled_task_id,
        body.task_execution_id,
        body.content,
        body.content_format || "text",
        body.title || null,
        body.summary || null,
        body.execution_completion_time,
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create message" },
      { status: 500 }
    );
  }
}
