import { ScheduledTaskWithModel } from "./types";
import { query } from "./db";

export interface DueSchedule extends ScheduledTaskWithModel {
  shouldExecute: boolean;
  reason?: string;
}

export async function findDueSchedules(
  currentHour: number,
  currentMinute: number,
  currentDayOfWeek: number,
  currentDayOfMonth: number
): Promise<DueSchedule[]> {
  const result = await query<ScheduledTaskWithModel>(
    `SELECT 
      st.id, st.name, st.ai_model_id, st.prompt_content, st.remark, st.is_active,
      st.schedule_type, st.execution_hour, st.execution_minute, st.timezone,
      st.day_of_week, st.day_of_month, st.effective_start_time, st.effective_end_time,
      st.last_execution_time, st.next_execution_time, st.created_at, st.updated_at,
      am.company_name as ai_model_company, am.model_name as ai_model_name
     FROM scheduled_tasks st
     JOIN ai_models am ON st.ai_model_id = am.id
     WHERE st.is_active = true
       AND st.execution_hour = $1
       AND st.execution_minute = $2
     ORDER BY st.created_at DESC`,
    [currentHour, currentMinute]
  );

  const schedules = result.rows;
  const dueSchedules: DueSchedule[] = [];

  for (const schedule of schedules) {
    const shouldExecute = shouldScheduleRun(
      schedule,
      currentDayOfWeek,
      currentDayOfMonth
    );

    if (shouldExecute) {
      dueSchedules.push({
        ...schedule,
        shouldExecute: true,
      });
    }
  }

  return dueSchedules;
}

function shouldScheduleRun(
  schedule: ScheduledTaskWithModel,
  currentDayOfWeek: number,
  currentDayOfMonth: number
): boolean {
  const scheduleType = schedule.schedule_type;

  switch (scheduleType) {
    case "daily":
      return true;

    case "weekly":
      if (schedule.day_of_week === null) {
        return true;
      }
      return schedule.day_of_week === currentDayOfWeek;

    case "monthly":
      if (schedule.day_of_month === null) {
        return true;
      }
      return schedule.day_of_month === currentDayOfMonth;

    default:
      return false;
  }
}

export function getCurrentTimeInTimezone(timezone: string = "UTC"): {
  hour: number;
  minute: number;
  dayOfWeek: number;
  dayOfMonth: number;
} {
  const now = new Date();

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: "numeric",
    minute: "numeric",
    hour12: false,
  };

  const dateOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    day: "numeric",
  };

  const weekdayOptions: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    weekday: "short",
  };

  const timeFormatter = new Intl.DateTimeFormat("en-US", timeOptions);
  const dateFormatter = new Intl.DateTimeFormat("en-US", dateOptions);
  const weekdayFormatter = new Intl.DateTimeFormat("en-US", weekdayOptions);

  const timeParts = timeFormatter.formatToParts(now);
  const dateParts = dateFormatter.formatToParts(now);
  const weekdayStr = weekdayFormatter.format(now);

  const hour = parseInt(timeParts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(timeParts.find((p) => p.type === "minute")?.value || "0", 10);
  const dayOfMonth = parseInt(dateParts.find((p) => p.type === "day")?.value || "1", 10);

  const dayOfWeek = weekdayToNumber(weekdayStr);

  return { hour, minute, dayOfWeek, dayOfMonth };
}

function weekdayToNumber(weekday: string): number {
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return weekdayMap[weekday] ?? 0;
}
