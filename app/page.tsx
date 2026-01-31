"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  Clock,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import { MessageDetailModal, type Message as ModalMessage } from "./components/MessageDetailModal";
import { AddScheduleModal, ScheduleDraft } from "./components/AddScheduleModal";
import { Sidebar } from "./components/Sidebar";
import { messagesApi, schedulesApi, aiModelsApi } from "@/lib/api-client";
import { MessageWithDetails, AIModel } from "@/lib/types";

interface DisplayMessage {
  id: number;
  title: string;
  time: string;
  preview: string;
  status: string;
  model: string;
  isRead: boolean;
  content: string;
  prompt: string;
  schedule: string;
  rawData: MessageWithDetails;
}

function formatTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (days === 0) {
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } else if (days === 1) {
    return "Yesterday";
  } else {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

function getScheduleDisplay(task: MessageWithDetails): string {
  const type = task.schedule_type;
  const hour = task.execution_hour.toString().padStart(2, "0");
  const minute = task.execution_minute.toString().padStart(2, "0");
  const time = `${hour}:${minute}`;
  
  if (type === "daily") return `Daily · ${time}`;
  if (type === "weekly") return `Weekly · ${time}`;
  if (type === "monthly") return `Monthly · ${time}`;
  return `${type} · ${time}`;
}

export default function Dashboard() {
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ModalMessage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadMessages();
    loadAiModels();
  }, []);

  async function loadMessages() {
    try {
      setIsLoading(true);
      const response = await messagesApi.getAll({ limit: 50 });
      if (response.success && response.data) {
        const displayMessages: DisplayMessage[] = response.data.map((msg) => ({
          id: msg.id,
          title: msg.title || msg.task_name || "Untitled Message",
          time: formatTime(msg.created_at),
          preview: msg.summary || msg.content.substring(0, 100) + "...",
          status: "DELIVERED",
          model: `${msg.ai_model_company} ${msg.ai_model_name}`,
          isRead: msg.is_read,
          content: msg.content,
          prompt: msg.prompt_content,
          schedule: getScheduleDisplay(msg),
          rawData: msg,
        }));
        setMessages(displayMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadAiModels() {
    try {
      const response = await aiModelsApi.getAll();
      if (response.success && response.data) {
        setAiModels(response.data);
      }
    } catch (err) {
      console.error("Failed to load AI models:", err);
    }
  }

  const handleMessageClick = (msg: DisplayMessage) => {
    setSelectedMessage({
      id: msg.id.toString(),
      title: msg.title,
      generatedAt: msg.time,
      model: msg.model,
      schedule: msg.schedule,
      status: "DELIVERED",
      content: msg.content,
      prompt: msg.prompt,
      rawData: msg.rawData,
      onMarkAsRead: handleMarkAsRead,
      onAddToFavorites: handleAddToFavorites,
      onDelete: handleDeleteMessage,
    });
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await messagesApi.markAsRead(parseInt(id));
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id.toString() === id ? { ...msg, isRead: true } : msg
        )
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleAddToFavorites = async (id: string) => {
    try {
      await messagesApi.addToFavorites(parseInt(id));
    } catch (err) {
      console.error("Failed to add to favorites:", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await messagesApi.delete(parseInt(id));
      setMessages((prev) => prev.filter((msg) => msg.id.toString() !== id));
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const handleCreateSchedule = async (draft: ScheduleDraft) => {
    try {
      const selectedModel = aiModels.find((m) => 
        `${m.company_name} ${m.model_name}` === draft.model
      );
      
      if (!selectedModel) {
        console.error("Selected model not found");
        return;
      }

      await schedulesApi.create({
        name: draft.taskName,
        ai_model_id: selectedModel.id,
        prompt_content: draft.prompt,
        remark: draft.notes,
        schedule_type: draft.frequency,
        execution_hour: parseInt(draft.hour),
        execution_minute: parseInt(draft.minute),
      });
      
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to create schedule:", err);
    }
  };

  const filteredMessages = messages.filter(
    (msg) =>
      msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-bg-primary font-sans text-text-primary">
      <Sidebar activeItem="Messages" />

      <main className="ml-[280px] flex-1">
        <div className="mx-auto max-w-[1160px] px-10 py-8">
          <header className="mb-12 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[40px] font-medium leading-tight">Messages</h2>
              <p className="text-sm text-text-tertiary">Your latest AI-generated messages</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-primary bg-bg-surface transition-colors hover:bg-bg-muted">
                <Bell size={20} className="text-text-primary" />
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 font-semibold text-white transition-opacity hover:opacity-90"
              >
                <Plus size={16} />
                <span>New Schedule</span>
              </button>
            </div>
          </header>

          <div className="mb-8 flex h-12 w-full items-center gap-3 rounded-lg border border-border-primary bg-bg-surface px-4">
            <Search size={18} className="text-text-muted" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">RECENT MESSAGES</span>
            <span className="text-sm font-medium text-text-tertiary">{filteredMessages.length} messages</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">Loading messages...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="space-y-0">
              {filteredMessages.map((msg) => (
                <MessageItem
                  key={msg.id}
                  {...msg}
                  onClick={() => handleMessageClick(msg)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {selectedMessage && (
        <MessageDetailModal
          isOpen={!!selectedMessage}
          onClose={() => setSelectedMessage(null)}
          message={selectedMessage}
        />
      )}

      <AddScheduleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSchedule}
        aiModels={aiModels}
      />
    </div>
  );
}

function MessageItem({
  title,
  time,
  preview,
  status,
  model,
  isRead,
  onClick,
}: DisplayMessage & { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col gap-1 border-b border-border-primary py-5 transition-colors hover:bg-white/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isRead && <div className="h-2 w-2 rounded-full bg-accent-primary" />}
          <h3 className="font-medium text-text-primary">{title}</h3>
        </div>
        <span className="text-xs text-text-tertiary">{time}</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded bg-bg-muted px-2 py-0.5">
          <Clock size={12} className="text-text-tertiary" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
            {status}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-text-tertiary" />
          <span className="text-[11px] font-medium text-text-tertiary">{model}</span>
        </div>
      </div>

      <p className="line-clamp-1 max-w-2xl text-[13px] leading-relaxed text-text-secondary">
        {preview}
      </p>

      <div className="absolute right-0 top-1/2 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          className="p-2 text-text-tertiary hover:text-text-primary"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
