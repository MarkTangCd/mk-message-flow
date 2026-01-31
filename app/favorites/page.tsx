"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  MoreHorizontal,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { MessageDetailModal, type Message as ModalMessage } from "../components/MessageDetailModal";
import { Sidebar } from "../components/Sidebar";
import { favoritesApi, messagesApi } from "@/lib/api-client";
import { MessageWithDetails } from "@/lib/types";

interface DisplayFavorite {
  id: number;
  title: string;
  time: string;
  preview: string;
  status: string;
  model: string;
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

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<DisplayFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ModalMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadFavorites();
  }, []);

  async function loadFavorites() {
    try {
      setIsLoading(true);
      const response = await favoritesApi.getAll({ limit: 50 });
      if (response.success && response.data) {
        const displayFavorites: DisplayFavorite[] = response.data.map((msg) => ({
          id: msg.id,
          title: msg.title || msg.task_name || "Untitled Message",
          time: formatTime(msg.favorited_at || msg.created_at),
          preview: msg.summary || msg.content.substring(0, 100) + "...",
          status: "DELIVERED",
          model: `${msg.ai_model_company} ${msg.ai_model_name}`,
          content: msg.content,
          prompt: msg.prompt_content,
          schedule: getScheduleDisplay(msg),
          rawData: msg,
        }));
        setFavorites(displayFavorites);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load favorites");
    } finally {
      setIsLoading(false);
    }
  }

  const handleMessageClick = (msg: DisplayFavorite) => {
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
      onAddToFavorites: handleRemoveFromFavorites,
      onDelete: handleDeleteMessage,
    });
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await messagesApi.markAsRead(parseInt(id));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleRemoveFromFavorites = async (id: string) => {
    try {
      await messagesApi.removeFromFavorites(parseInt(id));
      setFavorites((prev) => prev.filter((msg) => msg.id.toString() !== id));
    } catch (err) {
      console.error("Failed to remove from favorites:", err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    try {
      await messagesApi.delete(parseInt(id));
      setFavorites((prev) => prev.filter((msg) => msg.id.toString() !== id));
      setSelectedMessage(null);
    } catch (err) {
      console.error("Failed to delete message:", err);
    }
  };

  const filteredFavorites = favorites.filter(
    (msg) =>
      msg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      msg.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-bg-primary font-sans text-text-primary">
      <Sidebar activeItem="Favorites" />

      <main className="ml-[280px] flex-1">
        <div className="mx-auto max-w-[1160px] px-10 py-8">
          <header className="mb-12">
            <h2 className="font-serif text-[40px] font-medium leading-tight">Favorites</h2>
            <p className="text-sm text-text-tertiary">Your saved messages</p>
          </header>

          <div className="mb-8 flex h-12 w-full items-center gap-3 rounded-lg border border-border-primary bg-bg-surface px-4">
            <Search size={18} className="text-text-muted" />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </div>

          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">FAVORITED MESSAGES</span>
            <span className="text-sm font-medium text-text-tertiary">{filteredFavorites.length} messages</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">Loading favorites...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="space-y-0">
              {filteredFavorites.map((msg) => (
                <FavoriteMessageItem
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
    </div>
  );
}

function FavoriteMessageItem({
  title,
  time,
  preview,
  status,
  model,
  onClick,
}: DisplayFavorite & { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col gap-1 border-b border-border-primary bg-bg-surface py-5 transition-colors hover:bg-white/50"
    >
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Star size={16} className="fill-accent-secondary text-accent-secondary" />
          <h3 className="font-medium text-text-primary">{title}</h3>
        </div>
        <span className="text-xs text-text-tertiary">{time}</span>
      </div>

      <div className="flex items-center gap-3 px-4">
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

      <p className="line-clamp-1 max-w-2xl px-4 text-[13px] leading-relaxed text-text-secondary">
        {preview}
      </p>

      <div className="absolute right-4 top-1/2 flex -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
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
