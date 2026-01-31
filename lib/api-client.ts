import {
  AIModel,
  CreateAIModelInput,
  UpdateAIModelInput,
  ScheduledTaskWithModel,
  CreateScheduledTaskInput,
  UpdateScheduledTaskInput,
  MessageWithDetails,
  CreateMessageInput,
  UpdateMessageInput,
} from "@/lib/types";

const API_BASE = "/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data;
}

export const aiModelsApi = {
  getAll: () => fetchApi<AIModel[]>("/ai-models"),
  getById: (id: number) => fetchApi<AIModel>(`/ai-models/${id}`),
  create: (input: CreateAIModelInput) =>
    fetchApi<AIModel>("/ai-models", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, input: UpdateAIModelInput) =>
    fetchApi<AIModel>(`/ai-models/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/ai-models/${id}`, {
      method: "DELETE",
    }),
};

export const schedulesApi = {
  getAll: () => fetchApi<ScheduledTaskWithModel[]>("/schedules"),
  getById: (id: number) => fetchApi<ScheduledTaskWithModel>(`/schedules/${id}`),
  create: (input: CreateScheduledTaskInput) =>
    fetchApi<ScheduledTaskWithModel>("/schedules", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, input: UpdateScheduledTaskInput) =>
    fetchApi<ScheduledTaskWithModel>(`/schedules/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/schedules/${id}`, {
      method: "DELETE",
    }),
};

export const messagesApi = {
  getAll: (params?: { isRead?: boolean; isFavorite?: boolean; taskId?: number; limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.isRead !== undefined) searchParams.append("isRead", String(params.isRead));
    if (params?.isFavorite !== undefined) searchParams.append("isFavorite", String(params.isFavorite));
    if (params?.taskId !== undefined) searchParams.append("taskId", String(params.taskId));
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.append("offset", String(params.offset));
    
    const queryString = searchParams.toString();
    return fetchApi<MessageWithDetails[]>(`/messages${queryString ? `?${queryString}` : ""}`);
  },
  getById: (id: number) => fetchApi<MessageWithDetails>(`/messages/${id}`),
  create: (input: CreateMessageInput) =>
    fetchApi<MessageWithDetails>("/messages", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  update: (id: number, input: UpdateMessageInput) =>
    fetchApi<MessageWithDetails>(`/messages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
  delete: (id: number) =>
    fetchApi<void>(`/messages/${id}`, {
      method: "DELETE",
    }),
  markAsRead: (id: number) =>
    fetchApi<MessageWithDetails>(`/messages/${id}/read`, {
      method: "POST",
    }),
  addToFavorites: (id: number) =>
    fetchApi<MessageWithDetails>(`/messages/${id}/favorite`, {
      method: "POST",
    }),
  removeFromFavorites: (id: number) =>
    fetchApi<MessageWithDetails>(`/messages/${id}/favorite`, {
      method: "DELETE",
    }),
};

export const favoritesApi = {
  getAll: (params?: { limit?: number; offset?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.limit !== undefined) searchParams.append("limit", String(params.limit));
    if (params?.offset !== undefined) searchParams.append("offset", String(params.offset));
    
    const queryString = searchParams.toString();
    return fetchApi<MessageWithDetails[]>(`/favorites${queryString ? `?${queryString}` : ""}`);
  },
};
