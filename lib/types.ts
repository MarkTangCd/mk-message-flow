// AI Model types
export interface AIModel {
  id: number;
  company_name: string;
  model_name: string;
  remark: string | null;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAIModelInput {
  company_name: string;
  model_name: string;
  remark?: string;
}

export interface UpdateAIModelInput {
  company_name?: string;
  model_name?: string;
  remark?: string;
  is_active?: boolean;
}

// Scheduled Task types
export type ScheduleType = "daily" | "weekly" | "monthly";

export interface ScheduledTask {
  id: number;
  name: string;
  ai_model_id: number;
  prompt_content: string;
  remark: string | null;
  is_active: boolean;
  schedule_type: ScheduleType;
  execution_hour: number;
  execution_minute: number;
  timezone: string;
  day_of_week: number | null;
  day_of_month: number | null;
  effective_start_time: Date | null;
  effective_end_time: Date | null;
  last_execution_time: Date | null;
  next_execution_time: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface ScheduledTaskWithModel extends ScheduledTask {
  ai_model_company: string;
  ai_model_name: string;
}

export interface CreateScheduledTaskInput {
  name: string;
  ai_model_id: number;
  prompt_content: string;
  remark?: string;
  schedule_type?: ScheduleType;
  execution_hour?: number;
  execution_minute?: number;
  timezone?: string;
  day_of_week?: number;
  day_of_month?: number;
  effective_start_time?: Date;
  effective_end_time?: Date;
}

export interface UpdateScheduledTaskInput {
  name?: string;
  ai_model_id?: number;
  prompt_content?: string;
  remark?: string;
  is_active?: boolean;
  schedule_type?: ScheduleType;
  execution_hour?: number;
  execution_minute?: number;
  timezone?: string;
  day_of_week?: number;
  day_of_month?: number;
  effective_start_time?: Date;
  effective_end_time?: Date;
}

// Task Execution types
export type ExecutionStatus = "pending" | "running" | "success" | "failed" | "skipped";

export interface TaskExecution {
  id: number;
  scheduled_task_id: number;
  ai_model_id: number;
  scheduled_execution_time: Date;
  actual_start_time: Date | null;
  actual_finish_time: Date | null;
  execution_status: ExecutionStatus;
  error_message: string | null;
  prompt_snapshot: string;
    ai_request_payload: Record<string, unknown> | null;
  ai_response_raw: string | null;
  created_at: Date;
}

// Message types
export type ContentFormat = "text" | "markdown" | "json" | "html";

export interface Message {
  id: number;
  scheduled_task_id: number;
  task_execution_id: number;
  content: string;
  content_format: ContentFormat;
  title: string | null;
  summary: string | null;
  execution_completion_time: Date;
  is_read: boolean;
  read_at: Date | null;
  is_favorite: boolean;
  favorited_at: Date | null;
  priority: number;
  created_at: Date;
}

export interface MessageWithDetails extends Message {
  task_name: string;
  ai_model_company: string;
  ai_model_name: string;
  schedule_type: ScheduleType;
  execution_hour: number;
  execution_minute: number;
  prompt_content: string;
}

export interface CreateMessageInput {
  scheduled_task_id: number;
  task_execution_id: number;
  content: string;
  content_format?: ContentFormat;
  title?: string;
  summary?: string;
  execution_completion_time: Date;
}

export interface UpdateMessageInput {
  is_read?: boolean;
  is_favorite?: boolean;
  title?: string;
  summary?: string;
  priority?: number;
}
