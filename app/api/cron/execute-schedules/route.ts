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

    const { hour, minute, dayOfWeek, dayOfMonth } = getCurrentTimeInTimezone("UTC");
    console.log(`[Cron] Current UTC time: ${hour}:${minute}`);

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
  return await withTransaction(async (client) => {
    const execTime = new Date();
    
    const execResult = await client.query<TaskExecution>(
      `INSERT INTO task_executions (scheduled_task_id, ai_model_id, scheduled_execution_time, execution_status, prompt_snapshot)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [schedule.id, schedule.ai_model_id, execTime, "running", schedule.prompt_content]
    );
    
    const taskExec = execResult.rows[0];
    const startTime = new Date();

    try {
      const aiResult = await executeAIRequest(
        schedule.ai_model_company,
        schedule.ai_model_name,
        schedule.prompt_content
      );

      const finishTime = new Date();

      if (!aiResult.success) {
        await client.query(
          `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
          [startTime, finishTime, aiResult.error, taskExec.id]
        );
        return { success: false, error: aiResult.error };
      }

      const msgResult = await client.query<Message>(
        `INSERT INTO messages (scheduled_task_id, task_execution_id, content, content_format, title, execution_completion_time)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [schedule.id, taskExec.id, aiResult.content, "text", schedule.name, finishTime]
      );

      await client.query(
        `UPDATE task_executions SET execution_status = 'success', actual_start_time = $1, actual_finish_time = $2 WHERE id = $3`,
        [startTime, finishTime, taskExec.id]
      );

      await client.query(
        `UPDATE scheduled_tasks SET last_execution_time = $1 WHERE id = $2`,
        [finishTime, schedule.id]
      );

      return { success: true, messageId: msgResult.rows[0].id };
    } catch (error) {
      const finishTime = new Date();
      await client.query(
        `UPDATE task_executions SET execution_status = 'failed', actual_start_time = $1, actual_finish_time = $2, error_message = $3 WHERE id = $4`,
        [startTime, finishTime, String(error), taskExec.id]
      );
      throw error;
    }
  });
}
