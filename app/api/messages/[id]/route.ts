import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { Message, MessageWithDetails, UpdateMessageInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
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
       WHERE m.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch message" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateMessageInput;

    const updates: string[] = [];
    const values: (string | number | boolean | null)[] = [];
    let paramIndex = 1;

    if (body.is_read !== undefined) {
      updates.push(`is_read = $${paramIndex++}`);
      values.push(body.is_read);
      if (body.is_read) {
        updates.push(`read_at = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`read_at = NULL`);
      }
    }

    if (body.is_favorite !== undefined) {
      updates.push(`is_favorite = $${paramIndex++}`);
      values.push(body.is_favorite);
      if (body.is_favorite) {
        updates.push(`favorited_at = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`favorited_at = NULL`);
      }
    }

    if (body.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(body.title);
    }

    if (body.summary !== undefined) {
      updates.push(`summary = $${paramIndex++}`);
      values.push(body.summary);
    }

    if (body.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(body.priority);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await query<Message>(
      `UPDATE messages 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update message" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await query(
      `DELETE FROM messages WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Message not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Message deleted" });
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete message" },
      { status: 500 }
    );
  }
}
