import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";
import { ScheduledTask, ScheduledTaskWithModel, CreateScheduledTaskInput } from "@/lib/types";

export async function GET(): Promise<NextResponse> {
  try {
    const result = await query<ScheduledTaskWithModel>(
      `SELECT 
        st.id, st.name, st.ai_model_id, st.prompt_content, st.remark, st.is_active,
        st.schedule_type, st.execution_hour, st.execution_minute, st.timezone,
        st.day_of_week, st.day_of_month, st.effective_start_time, st.effective_end_time,
        st.last_execution_time, st.next_execution_time, st.created_at, st.updated_at,
        am.company_name as ai_model_company, am.model_name as ai_model_name
       FROM scheduled_tasks st
       JOIN ai_models am ON st.ai_model_id = am.id
       ORDER BY st.created_at DESC`
    );

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching scheduled tasks:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch scheduled tasks" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CreateScheduledTaskInput = await request.json();

    if (!body.name || !body.ai_model_id || !body.prompt_content) {
      return NextResponse.json(
        { success: false, error: "Name, AI model, and prompt are required" },
        { status: 400 }
      );
    }

    const result = await query<ScheduledTask>(
      `INSERT INTO scheduled_tasks (
        name, ai_model_id, prompt_content, remark, schedule_type,
        execution_hour, execution_minute, timezone, day_of_week, day_of_month,
        effective_start_time, effective_end_time
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        body.name,
        body.ai_model_id,
        body.prompt_content,
        body.remark || null,
        body.schedule_type || "daily",
        body.execution_hour ?? 0,
        body.execution_minute ?? 0,
        body.timezone || "Asia/Shanghai",
        body.day_of_week || null,
        body.day_of_month || null,
        body.effective_start_time || null,
        body.effective_end_time || null,
      ]
    );

    return NextResponse.json({ success: true, data: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error("Error creating scheduled task:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create scheduled task" },
      { status: 500 }
    );
  }
}
