# MessageFlow API Documentation

This document describes all the available API endpoints for the MessageFlow personal information subscription platform.

## Base URL

All API endpoints are prefixed with `/api`.

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "error": "Error message if success is false"
}
```

## AI Models API

### List All AI Models
- **Endpoint**: `GET /api/ai-models`
- **Description**: Retrieves all configured AI models
- **Response**: Array of AI model objects

### Get Single AI Model
- **Endpoint**: `GET /api/ai-models/:id`
- **Description**: Retrieves a specific AI model by ID
- **Response**: Single AI model object

### Create AI Model
- **Endpoint**: `POST /api/ai-models`
- **Description**: Creates a new AI model configuration
- **Request Body**:
  ```json
  {
    "company_name": "OpenAI",
    "model_name": "GPT-4",
    "remark": "Optional description"
  }
  ```
- **Response**: Created AI model object

### Update AI Model
- **Endpoint**: `PUT /api/ai-models/:id`
- **Description**: Updates an existing AI model
- **Request Body**: Any combination of fields to update
  ```json
  {
    "company_name": "Updated Company",
    "model_name": "Updated Model",
    "remark": "Updated notes",
    "is_active": false
  }
  ```
- **Response**: Updated AI model object

### Delete AI Model
- **Endpoint**: `DELETE /api/ai-models/:id`
- **Description**: Deletes an AI model (will fail if referenced by scheduled tasks)
- **Response**: Success message

## Scheduled Tasks API

### List All Scheduled Tasks
- **Endpoint**: `GET /api/schedules`
- **Description**: Retrieves all scheduled tasks with AI model details
- **Response**: Array of scheduled task objects with joined AI model info

### Get Single Scheduled Task
- **Endpoint**: `GET /api/schedules/:id`
- **Description**: Retrieves a specific scheduled task by ID
- **Response**: Single scheduled task object with AI model details

### Create Scheduled Task
- **Endpoint**: `POST /api/schedules`
- **Description**: Creates a new scheduled task
- **Request Body**:
  ```json
  {
    "name": "Daily Market Analysis",
    "ai_model_id": 1,
    "prompt_content": "Analyze market trends...",
    "remark": "Optional notes",
    "schedule_type": "daily",
    "execution_hour": 9,
    "execution_minute": 0,
    "timezone": "UTC",
    "day_of_week": null,
    "day_of_month": null
  }
  ```
- **Response**: Created scheduled task object

### Update Scheduled Task
- **Endpoint**: `PUT /api/schedules/:id`
- **Description**: Updates an existing scheduled task
- **Request Body**: Any combination of fields to update
- **Response**: Updated scheduled task object

### Delete Scheduled Task
- **Endpoint**: `DELETE /api/schedules/:id`
- **Description**: Deletes a scheduled task and all associated messages/executions (cascade delete)
- **Response**: Success message

## Messages API

### List Messages
- **Endpoint**: `GET /api/messages`
- **Description**: Retrieves messages with optional filtering
- **Query Parameters**:
  - `isRead` (boolean): Filter by read status
  - `isFavorite` (boolean): Filter by favorite status
  - `taskId` (number): Filter by scheduled task ID
  - `limit` (number): Maximum results (default: 50)
  - `offset` (number): Pagination offset (default: 0)
- **Response**: Array of message objects with task and model details

### Get Single Message
- **Endpoint**: `GET /api/messages/:id`
- **Description**: Retrieves a specific message by ID
- **Response**: Single message object with full details

### Create Message
- **Endpoint**: `POST /api/messages`
- **Description**: Creates a new message (typically called by the task execution system)
- **Request Body**:
  ```json
  {
    "scheduled_task_id": 1,
    "task_execution_id": 1,
    "content": "AI-generated content...",
    "content_format": "text",
    "title": "Optional title",
    "summary": "Optional summary",
    "execution_completion_time": "2026-01-31T10:00:00Z"
  }
  ```
- **Response**: Created message object

### Update Message
- **Endpoint**: `PATCH /api/messages/:id`
- **Description**: Partially updates a message (e.g., mark as read, favorite)
- **Request Body**:
  ```json
  {
    "is_read": true,
    "is_favorite": true,
    "title": "Updated title",
    "summary": "Updated summary",
    "priority": 1
  }
  ```
- **Response**: Updated message object

### Delete Message
- **Endpoint**: `DELETE /api/messages/:id`
- **Description**: Deletes a message
- **Response**: Success message

### Mark Message as Read
- **Endpoint**: `POST /api/messages/:id/read`
- **Description**: Marks a message as read (sets is_read=true and read_at timestamp)
- **Response**: Updated message object

### Add Message to Favorites
- **Endpoint**: `POST /api/messages/:id/favorite`
- **Description**: Adds a message to favorites
- **Response**: Updated message object

### Remove Message from Favorites
- **Endpoint**: `DELETE /api/messages/:id/favorite`
- **Description**: Removes a message from favorites
- **Response**: Updated message object

## Favorites API

### List Favorites
- **Endpoint**: `GET /api/favorites`
- **Description**: Retrieves all favorited messages
- **Query Parameters**:
  - `limit` (number): Maximum results (default: 50)
  - `offset` (number): Pagination offset (default: 0)
- **Response**: Array of favorited message objects

## Database Configuration

The API requires PostgreSQL database connection. Configure these environment variables:

```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=messageflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
```

## Database Schema

The database schema is defined in `sql/schema.sql`. It includes:

1. **ai_models** - AI model configurations
2. **scheduled_tasks** - Task definitions with schedule settings
3. **task_executions** - Execution audit trail
4. **messages** - AI-generated messages with user interactions

## Frontend API Client

A TypeScript API client is available at `lib/api-client.ts`:

```typescript
import { aiModelsApi, schedulesApi, messagesApi, favoritesApi } from "@/lib/api-client";

// Example usage
const models = await aiModelsApi.getAll();
const schedules = await schedulesApi.getAll();
const messages = await messagesApi.getAll({ limit: 10 });
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
