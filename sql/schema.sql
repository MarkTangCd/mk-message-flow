-- ========================================================
-- Information Subscription Platform Database Schema
-- ========================================================
-- This SQL file creates all necessary tables for the personal
-- information subscription platform with AI model integration.
--
-- Tables:
--   1. ai_models - AI model configurations
--   2. scheduled_tasks - Subscription task definitions
--   3. task_executions - Task execution records
--   4. messages - AI-generated messages and user interactions
--
-- Features:
--   - Full foreign key constraints with cascade rules
--   - Optimized indexes for common queries
--   - Support for daily/weekly/monthly schedules
--   - Message read/favorite tracking
--   - Execution audit trail with snapshots
-- ========================================================

-- --------------------------------------------------------
-- 1. AI Model Configuration Table
-- --------------------------------------------------------
-- Stores manually configured AI models for task execution
CREATE TABLE ai_models (
    id BIGSERIAL PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    model_name VARCHAR(255) NOT NULL,
    remark TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexes for ai_models
CREATE INDEX idx_ai_models_active ON ai_models(is_active);
CREATE INDEX idx_ai_models_company ON ai_models(company_name);

-- Comments for documentation
COMMENT ON TABLE ai_models IS 'AI model configurations for scheduled tasks';
COMMENT ON COLUMN ai_models.id IS 'AI model unique identifier';
COMMENT ON COLUMN ai_models.company_name IS 'Company/provider name (e.g., OpenAI, Anthropic)';
COMMENT ON COLUMN ai_models.model_name IS 'Model name (e.g., GPT-4, Claude-3)';
COMMENT ON COLUMN ai_models.remark IS 'Optional description or notes';
COMMENT ON COLUMN ai_models.is_active IS 'Availability status for selection';

-- --------------------------------------------------------
-- 2. Scheduled Tasks Table
-- --------------------------------------------------------
-- Defines repeatable AI interaction tasks with schedule configuration
CREATE TABLE scheduled_tasks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    ai_model_id BIGINT NOT NULL,
    prompt_content TEXT NOT NULL,
    remark TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    
    -- Schedule configuration
    schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly')),
    execution_hour INTEGER NOT NULL CHECK (execution_hour >= 0 AND execution_hour <= 23),
    execution_minute INTEGER NOT NULL CHECK (execution_minute >= 0 AND execution_minute <= 59),
    timezone VARCHAR(50) DEFAULT 'UTC' NOT NULL,
    
    -- Schedule-specific fields
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday (for weekly)
    day_of_month INTEGER CHECK (day_of_month >= 1 AND day_of_month <= 31), -- 1-31 (for monthly)
    
    -- Lifecycle control
    effective_start_time TIMESTAMP WITH TIME ZONE,
    effective_end_time TIMESTAMP WITH TIME ZONE,
    last_execution_time TIMESTAMP WITH TIME ZONE,
    next_execution_time TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraint
    CONSTRAINT fk_scheduled_tasks_ai_model 
        FOREIGN KEY (ai_model_id) 
        REFERENCES ai_models(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Indexes for scheduled_tasks
CREATE INDEX idx_scheduled_tasks_active ON scheduled_tasks(is_active);
CREATE INDEX idx_scheduled_tasks_model ON scheduled_tasks(ai_model_id);
CREATE INDEX idx_scheduled_tasks_schedule_type ON scheduled_tasks(schedule_type);
CREATE INDEX idx_scheduled_tasks_next_execution ON scheduled_tasks(next_execution_time) 
    WHERE is_active = TRUE AND next_execution_time IS NOT NULL;
CREATE INDEX idx_scheduled_tasks_created ON scheduled_tasks(created_at DESC);

-- Comments
COMMENT ON TABLE scheduled_tasks IS 'Scheduled AI interaction tasks with recurrence configuration';
COMMENT ON COLUMN scheduled_tasks.id IS 'Task unique identifier';
COMMENT ON COLUMN scheduled_tasks.name IS 'Task name for display';
COMMENT ON COLUMN scheduled_tasks.ai_model_id IS 'Reference to the AI model used';
COMMENT ON COLUMN scheduled_tasks.prompt_content IS 'Prompt template sent to AI';
COMMENT ON COLUMN scheduled_tasks.schedule_type IS 'Recurrence: daily, weekly, or monthly';
COMMENT ON COLUMN scheduled_tasks.execution_hour IS 'Hour of execution (0-23)';
COMMENT ON COLUMN scheduled_tasks.execution_minute IS 'Minute of execution (0-59)';
COMMENT ON COLUMN scheduled_tasks.day_of_week IS 'Day of week for weekly tasks (0=Sunday)';
COMMENT ON COLUMN scheduled_tasks.day_of_month IS 'Day of month for monthly tasks (1-31)';
COMMENT ON COLUMN scheduled_tasks.next_execution_time IS 'Calculated next scheduled run time';
COMMENT ON COLUMN scheduled_tasks.last_execution_time IS 'Timestamp of most recent execution';

-- --------------------------------------------------------
-- 3. Task Executions Table
-- --------------------------------------------------------
-- Records every actual task execution with diagnostics and snapshots
CREATE TABLE task_executions (
    id BIGSERIAL PRIMARY KEY,
    scheduled_task_id BIGINT NOT NULL,
    ai_model_id BIGINT NOT NULL,
    
    -- Timing information
    scheduled_execution_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    actual_finish_time TIMESTAMP WITH TIME ZONE,
    
    -- Status and diagnostics
    execution_status VARCHAR(20) NOT NULL DEFAULT 'running' 
        CHECK (execution_status IN ('pending', 'running', 'success', 'failed', 'skipped')),
    error_message TEXT,
    
    -- Execution snapshots for audit and debugging
    prompt_snapshot TEXT NOT NULL,
    ai_request_payload JSONB,
    ai_response_raw TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_task_executions_scheduled_task 
        FOREIGN KEY (scheduled_task_id) 
        REFERENCES scheduled_tasks(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_task_executions_ai_model 
        FOREIGN KEY (ai_model_id) 
        REFERENCES ai_models(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
);

-- Indexes for task_executions
CREATE INDEX idx_task_executions_task ON task_executions(scheduled_task_id);
CREATE INDEX idx_task_executions_status ON task_executions(execution_status);
CREATE INDEX idx_task_executions_scheduled_time ON task_executions(scheduled_execution_time DESC);
CREATE INDEX idx_task_executions_created ON task_executions(created_at DESC);
CREATE INDEX idx_task_executions_task_status ON task_executions(scheduled_task_id, execution_status);

-- Comments
COMMENT ON TABLE task_executions IS 'Audit trail of all task executions with diagnostics';
COMMENT ON COLUMN task_executions.id IS 'Execution record unique identifier';
COMMENT ON COLUMN task_executions.scheduled_task_id IS 'Reference to parent scheduled task';
COMMENT ON COLUMN task_executions.ai_model_id IS 'AI model used for this execution';
COMMENT ON COLUMN task_executions.scheduled_execution_time IS 'Planned execution time';
COMMENT ON COLUMN task_executions.actual_start_time IS 'When execution actually started';
COMMENT ON COLUMN task_executions.actual_finish_time IS 'When execution completed';
COMMENT ON COLUMN task_executions.execution_status IS 'Current status: pending/running/success/failed/skipped';
COMMENT ON COLUMN task_executions.error_message IS 'Error details if execution failed';
COMMENT ON COLUMN task_executions.prompt_snapshot IS 'Copy of prompt at execution time';
COMMENT ON COLUMN task_executions.ai_request_payload IS 'Full request payload to AI (JSON)';
COMMENT ON COLUMN task_executions.ai_response_raw IS 'Raw AI response before processing';

-- --------------------------------------------------------
-- 4. Messages Table
-- --------------------------------------------------------
-- Stores AI-generated messages with user interaction tracking
CREATE TABLE messages (
    id BIGSERIAL PRIMARY KEY,
    scheduled_task_id BIGINT NOT NULL,
    task_execution_id BIGINT NOT NULL,
    
    -- Content
    content TEXT NOT NULL,
    content_format VARCHAR(20) DEFAULT 'text' 
        CHECK (content_format IN ('text', 'markdown', 'json', 'html')),
    title VARCHAR(500), -- Optional or auto-generated title
    summary TEXT, -- Optional summary for list view
    
    -- Execution reference
    execution_completion_time TIMESTAMP WITH TIME ZONE NOT NULL,
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Favorite status
    is_favorite BOOLEAN DEFAULT FALSE NOT NULL,
    favorited_at TIMESTAMP WITH TIME ZONE,
    
    -- Display helpers
    priority INTEGER DEFAULT 0, -- For custom sorting
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    
    -- Foreign key constraints
    CONSTRAINT fk_messages_scheduled_task 
        FOREIGN KEY (scheduled_task_id) 
        REFERENCES scheduled_tasks(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_messages_task_execution 
        FOREIGN KEY (task_execution_id) 
        REFERENCES task_executions(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
);

-- Indexes for messages
CREATE INDEX idx_messages_task ON messages(scheduled_task_id);
CREATE INDEX idx_messages_execution ON messages(task_execution_id);
CREATE INDEX idx_messages_read ON messages(is_read);
CREATE INDEX idx_messages_favorite ON messages(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_execution_time ON messages(execution_completion_time DESC);
CREATE INDEX idx_messages_read_created ON messages(is_read, created_at DESC);
CREATE INDEX idx_messages_task_read ON messages(scheduled_task_id, is_read);

-- Comments
COMMENT ON TABLE messages IS 'AI-generated messages from task executions with user interactions';
COMMENT ON COLUMN messages.id IS 'Message unique identifier';
COMMENT ON COLUMN messages.scheduled_task_id IS 'Source scheduled task';
COMMENT ON COLUMN messages.task_execution_id IS 'Source task execution record';
COMMENT ON COLUMN messages.content IS 'AI-generated message content';
COMMENT ON COLUMN messages.content_format IS 'Format: text/markdown/json/html';
COMMENT ON COLUMN messages.title IS 'Optional message title';
COMMENT ON COLUMN messages.is_read IS 'Whether user has read this message';
COMMENT ON COLUMN messages.read_at IS 'Timestamp when marked as read';
COMMENT ON COLUMN messages.is_favorite IS 'Whether user has bookmarked this';
COMMENT ON COLUMN messages.favorited_at IS 'Timestamp when favorited';
COMMENT ON COLUMN messages.execution_completion_time IS 'When the AI execution finished';

-- --------------------------------------------------------
-- Triggers for Updated At
-- --------------------------------------------------------
-- Automatically update the updated_at timestamp

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ai_models_updated_at 
    BEFORE UPDATE ON ai_models 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scheduled_tasks_updated_at 
    BEFORE UPDATE ON scheduled_tasks 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- --------------------------------------------------------
-- Sample Data (Optional - for development/testing)
-- --------------------------------------------------------

-- Sample AI Models
INSERT INTO ai_models (company_name, model_name, remark, is_active) VALUES
    ('OpenAI', 'GPT-4', 'General purpose large language model', TRUE),
    ('OpenAI', 'GPT-3.5-Turbo', 'Fast and cost-effective model', TRUE),
    ('Anthropic', 'Claude-3-Opus', 'Advanced reasoning and analysis', TRUE),
    ('Anthropic', 'Claude-3-Sonnet', 'Balanced performance and speed', TRUE),
    ('Google', 'Gemini Pro', 'Multimodal capabilities', TRUE);

-- --------------------------------------------------------
-- Schema Summary
-- --------------------------------------------------------
-- Total Tables: 4
-- Total Indexes: 20+
-- Total Foreign Keys: 6
-- 
-- Relationships:
--   - scheduled_tasks.ai_model_id -> ai_models.id
--   - task_executions.scheduled_task_id -> scheduled_tasks.id
--   - task_executions.ai_model_id -> ai_models.id
--   - messages.scheduled_task_id -> scheduled_tasks.id
--   - messages.task_execution_id -> task_executions.id
--
-- Key Features:
--   - Soft delete support via is_active flags
--   - Full execution audit trail with snapshots
--   - Flexible schedule configuration (daily/weekly/monthly)
--   - User interaction tracking (read/favorite)
--   - Optimized indexes for list queries
-- --------------------------------------------------------
