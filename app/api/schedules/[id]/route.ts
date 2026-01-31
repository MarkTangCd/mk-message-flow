import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ScheduledTask, ScheduledTaskWithModel, UpdateScheduledTaskInput } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const result = await query<ScheduledTaskWithModel>(
      `SELECT 
        st.id, st.name, st.ai_model_id, st.prompt_content, st.remark, st.is_active,
        st.schedule_type, st.execution_hour, st.execution_minute, st.timezone,
        st.day_of_week, st.day_of_month, st.effective_start_time, st.effective_end_time,
        st.last_execution_time, st.next_execution_time, st.created_at, st.updated_at,
        am.company_name as ai_model_company, am.model_name as ai_model_name
       FROM scheduled_tasks st
       JOIN ai_models am ON st.ai_model_id = am.id
       WHERE st.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching scheduled task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scheduled task" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const body = await request.json() as UpdateScheduledTaskInput;

    const updates: string[] = [];
    const values: (string | number | boolean | Date | null)[] = [];
    let paramIndex = 1;

    if (body.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(body.name);
    }
    if (body.ai_model_id !== undefined) {
      updates.push(`ai_model_id = $${paramIndex++}`);
      values.push(body.ai_model_id);
    }
    if (body.prompt_content !== undefined) {
      updates.push(`prompt_content = $${paramIndex++}`);
      values.push(body.prompt_content);
    }
    if (body.remark !== undefined) {
      updates.push(`remark = $${paramIndex++}`);
      values.push(body.remark);
    }
    if (body.is_active !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(body.is_active);
    }
    if (body.schedule_type !== undefined) {
      updates.push(`schedule_type = $${paramIndex++}`);
      values.push(body.schedule_type);
    }
    if (body.execution_hour !== undefined) {
      updates.push(`execution_hour = $${paramIndex++}`);
      values.push(body.execution_hour);
    }
    if (body.execution_minute !== undefined) {
      updates.push(`execution_minute = $${paramIndex++}`);
      values.push(body.execution_minute);
    }
    if (body.timezone !== undefined) {
      updates.push(`timezone = $${paramIndex++}`);
      values.push(body.timezone);
    }
    if (body.day_of_week !== undefined) {
      updates.push(`day_of_week = $${paramIndex++}`);
      values.push(body.day_of_week);
    }
    if (body.day_of_month !== undefined) {
      updates.push(`day_of_month = $${paramIndex++}`);
      values.push(body.day_of_month);
    }
    if (body.effective_start_time !== undefined) {
      updates.push(`effective_start_time = $${paramIndex++}`);
      values.push(body.effective_start_time);
    }
    if (body.effective_end_time !== undefined) {
      updates.push(`effective_end_time = $${paramIndex++}`);
      values.push(body.effective_end_time);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await query<ScheduledTask>(
      `UPDATE scheduled_tasks 
       SET ${updates.join(", ")} 
       WHERE id = $${paramIndex}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating scheduled task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update scheduled task" },
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
      `DELETE FROM scheduled_tasks WHERE id = $1 RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Scheduled task not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Scheduled task deleted" });
  } catch (error) {
    console.error("Error deleting scheduled task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete scheduled task" },
      { status: 500 }
    );
  }
}
