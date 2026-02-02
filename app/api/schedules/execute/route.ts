import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { executeAIRequest } from "@/lib/ai-service";
import type { TaskExecution, Message, ScheduledTaskWithModel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

interface ExecutionSummary {
  total: number;
  successful: number;
  failed: number;
}

interface TaskResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

export async function POST(): Promise<NextResponse> {
  const startTime = Date.now();
  const summary: ExecutionSummary = {
    total: 0,
    successful: 0,
    failed: 0,
  };

  try {
    console.log("[Manual Execute] Starting manual execution of all active schedules...");

    const { query } = await import("@/lib/db");

    const schedulesResult = await query<ScheduledTaskWithModel>(
      `SELECT 
        st.id, st.name, st.ai_model_id, st.prompt_content, st.remark, st.is_active,
        st.schedule_type, st.execution_hour, st.execution_minute, st.timezone,
        st.day_of_week, st.day_of_month, st.effective_start_time, st.effective_end_time,
        st.last_execution_time, st.next_execution_time, st.created_at, st.updated_at,
        am.company_name as ai_model_company, am.model_name as ai_model_name
       FROM scheduled_tasks st
       JOIN ai_models am ON st.ai_model_id = am.id
       WHERE st.is_active = true
       ORDER BY st.created_at DESC`
    );

    const activeSchedules = schedulesResult.rows;
    summary.total = activeSchedules.length;

    console.log(`[Manual Execute] Found ${activeSchedules.length} active schedules`);

    if (activeSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        data: summary,
        message: "No active schedules to execute",
      });
    }

    for (const schedule of activeSchedules) {
      try {
        const result = await executeScheduledTask(schedule);
        if (result.success) {
          summary.successful++;
        } else {
          summary.failed++;
        }
      } catch (error) {
        summary.failed++;
        console.error(`[Manual Execute] Error executing schedule ${schedule.id}:`, error);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[Manual Execute] Completed in ${duration}ms. Success: ${summary.successful}, Failed: ${summary.failed}`);

    return NextResponse.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("[Manual Execute] Error during manual execution:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

async function executeScheduledTask(schedule: ScheduledTaskWithModel): Promise<TaskResult> {
  console.log(`[Manual Execute] Starting execution for schedule ${schedule.id} (${schedule.name})`);

  return await withTransaction(async (client) => {
    const execTime = new Date();
    console.log(`[Manual Execute] Creating task_execution record for schedule ${schedule.id}`);

    const execResult = await client.query<TaskExecution>(
      `INSERT INTO task_executions (scheduled_task_id, ai_model_id, scheduled_execution_time, execution_status, prompt_snapshot, ai_request_payload, ai_response_raw)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        schedule.id,
        schedule.ai_model_id,
        execTime,
        "running",
        schedule.prompt_content,
        null,
        null
      ]
    );

    const taskExec = execResult.rows[0];
    const startTime = new Date();
    console.log(`[Manual Execute] Task execution record created with ID: ${taskExec.id}`);

    try {
      console.log(`[Manual Execute] Calling AI service for schedule ${schedule.id} with model ${schedule.ai_model_company}/${schedule.ai_model_name}`);

      const aiResult = await executeAIRequest(
        schedule.ai_model_company,
        schedule.ai_model_name,
        schedule.prompt_content
      );

      const finishTime = new Date();
      console.log(`[Manual Execute] AI request completed for schedule ${schedule.id}. Success: ${aiResult.success}`);

      if (!aiResult.success) {
        console.error(`[Manual Execute] AI execution failed for schedule ${schedule.id}: ${aiResult.error}`);
        await client.query(
          `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
          [startTime, finishTime, aiResult.error, taskExec.id]
        );
        return { success: false, error: aiResult.error };
      }

      console.log(`[Manual Execute] Creating message record for schedule ${schedule.id}`);
      const msgResult = await client.query<Message>(
        `INSERT INTO messages (scheduled_task_id, task_execution_id, content, content_format, title, execution_completion_time)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [schedule.id, taskExec.id, aiResult.content, "text", schedule.name, finishTime]
      );
      console.log(`[Manual Execute] Message created with ID: ${msgResult.rows[0].id}`);

      await client.query(
        `UPDATE task_executions SET execution_status = 'success', actual_start_time = $1, actual_finish_time = $2 WHERE id = $3`,
        [startTime, finishTime, taskExec.id]
      );
      console.log(`[Manual Execute] Task execution ${taskExec.id} updated to success`);

      await client.query(
        `UPDATE scheduled_tasks SET last_execution_time = $1 WHERE id = $2`,
        [finishTime, schedule.id]
      );
      console.log(`[Manual Execute] Schedule ${schedule.id} last_execution_time updated`);

      return { success: true, messageId: msgResult.rows[0].id };
    } catch (error) {
      const finishTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Manual Execute] Exception during task execution for schedule ${schedule.id}: ${errorMessage}`);

      await client.query(
        `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
        [startTime, finishTime, errorMessage, taskExec.id]
      );
      throw error;
    }
  });
}
