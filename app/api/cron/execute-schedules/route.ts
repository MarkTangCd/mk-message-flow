import { NextResponse } from "next/server";
import { withTransaction } from "@/lib/db";
import { findDueSchedules, getCurrentTimeInTimezone } from "@/lib/schedule-utils";
import { executeAIRequest } from "@/lib/ai-service";
import type { TaskExecution, Message, ScheduledTaskWithModel } from "@/lib/types";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(): Promise<NextResponse> {
  const startTime = Date.now();
  const executionResults: Array<{
    scheduleId: number;
    scheduleName: string;
    status: "success" | "failed" | "skipped";
    message?: string;
  }> = [];

  try {
    console.log("[Cron] Starting scheduled task execution...");

    const { hour, minute, dayOfWeek, dayOfMonth } = getCurrentTimeInTimezone("Asia/Shanghai");
    console.log(`[Cron] Current Asia/Shanghai time: ${hour}:${minute}`);

    const dueSchedules = await findDueSchedules(hour, minute, dayOfWeek, dayOfMonth);
    console.log(`[Cron] Found ${dueSchedules.length} schedules due`);

    if (dueSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No schedules due",
        executed: 0,
        results: [],
      });
    }

    for (const schedule of dueSchedules) {
      try {
        const result = await executeScheduledTask(schedule);
        executionResults.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          status: result.success ? "success" : "failed",
          message: result.success ? `Message ${result.messageId}` : result.error,
        });
      } catch (error) {
        executionResults.push({
          scheduleId: schedule.id,
          scheduleName: schedule.name,
          status: "failed",
          message: error instanceof Error ? error.message : "Unknown",
        });
      }
    }

    return NextResponse.json({
      success: true,
      executed: dueSchedules.length,
      results: executionResults,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}

interface TaskResult {
  success: boolean;
  messageId?: number;
  error?: string;
}

async function executeScheduledTask(schedule: ScheduledTaskWithModel): Promise<TaskResult> {
  console.log(`[Cron] Starting execution for schedule ${schedule.id} (${schedule.name})`);

  return await withTransaction(async (client) => {
    const execTime = new Date();
    console.log(`[Cron] Creating task_execution record for schedule ${schedule.id}`);

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
    console.log(`[Cron] Task execution record created with ID: ${taskExec.id}`);

    try {
      console.log(`[Cron] Calling AI service for schedule ${schedule.id} with model ${schedule.ai_model_company}/${schedule.ai_model_name}`);

      const aiResult = await executeAIRequest(
        schedule.ai_model_company,
        schedule.ai_model_name,
        schedule.prompt_content
      );

      const finishTime = new Date();
      console.log(`[Cron] AI request completed for schedule ${schedule.id}. Success: ${aiResult.success}`);

      if (!aiResult.success) {
        console.error(`[Cron] AI execution failed for schedule ${schedule.id}: ${aiResult.error}`);
        await client.query(
          `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
          [startTime, finishTime, aiResult.error, taskExec.id]
        );
        return { success: false, error: aiResult.error };
      }

      console.log(`[Cron] Creating message record for schedule ${schedule.id}`);
      const msgResult = await client.query<Message>(
        `INSERT INTO messages (scheduled_task_id, task_execution_id, content, content_format, title, execution_completion_time)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [schedule.id, taskExec.id, aiResult.content, "text", schedule.name, finishTime]
      );
      console.log(`[Cron] Message created with ID: ${msgResult.rows[0].id}`);

      await client.query(
        `UPDATE task_executions SET execution_status = 'success', actual_start_time = $1, actual_finish_time = $2 WHERE id = $3`,
        [startTime, finishTime, taskExec.id]
      );
      console.log(`[Cron] Task execution ${taskExec.id} updated to success`);

      await client.query(
        `UPDATE scheduled_tasks SET last_execution_time = $1 WHERE id = $2`,
        [finishTime, schedule.id]
      );
      console.log(`[Cron] Schedule ${schedule.id} last_execution_time updated`);

      return { success: true, messageId: msgResult.rows[0].id };
    } catch (error) {
      const finishTime = new Date();
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`[Cron] Exception during task execution for schedule ${schedule.id}: ${errorMessage}`);

      await client.query(
        `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
        [startTime, finishTime, errorMessage, taskExec.id]
      );
      throw error;
    }
  });
}
