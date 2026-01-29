"use client";

import React from "react";
import { X, Trash2, Star, Check } from "lucide-react";
import { clsx } from "clsx";

export interface Message {
  id: string;
  title: string;
  generatedAt: string; // e.g., "2 minutes ago"
  model: string; // e.g., "GPT-4"
  schedule: string; // e.g., "Daily · 09:00 AM"
  status: "DELIVERED" | "PENDING" | "FAILED";
  content: string;
  prompt: string;
}

interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

export function MessageDetailModal({
  isOpen,
  onClose,
  message,
}: MessageDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-bg-surface w-full max-w-2xl rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border-primary flex justify-between items-start">
          <div>
            <h2 className="font-serif text-2xl font-medium text-text-primary">
              {message.title}
            </h2>
            <p className="font-mono text-xs text-text-tertiary mt-1">
              Generated {message.generatedAt}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-bg-muted rounded-full transition-colors text-text-secondary"
          >
            <X size={20} />
          </button>
        </div>

        {/* Meta Bar */}
        <div className="px-6 py-4 border-b border-border-primary flex gap-8 bg-bg-primary/50">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
              AI Model
            </p>
            <p className="font-sans text-sm font-medium text-text-primary">
              {message.model}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
              Schedule
            </p>
            <p className="font-sans text-sm font-medium text-text-primary">
              {message.schedule}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-1">
              Status
            </p>
            <span
              className={clsx(
                "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase font-medium",
                message.status === "DELIVERED"
                  ? "bg-accent-primary text-white"
                  : "bg-bg-muted text-text-secondary"
              )}
            >
              {message.status}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <div className="mb-8">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-4">
              Message Content
            </p>
            <div className="prose prose-sm max-w-none font-sans text-text-secondary leading-relaxed whitespace-pre-line">
              {message.content}
            </div>
          </div>

          <div className="bg-bg-muted p-4 rounded-lg">
            <p className="font-mono text-[10px] uppercase tracking-wider text-text-tertiary mb-2">
              Prompt Used
            </p>
            <p className="font-sans text-sm text-text-secondary leading-relaxed">
              {message.prompt}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border-primary flex justify-end gap-3 bg-bg-surface">
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-primary text-text-primary font-medium text-sm hover:bg-bg-muted transition-colors">
            <Trash2 size={16} />
            Delete
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border-primary text-text-primary font-medium text-sm hover:bg-bg-muted transition-colors">
            <Star size={16} />
            Add to Favorites
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-primary text-white font-medium text-sm hover:opacity-90 transition-opacity">
            <Check size={16} />
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  );
}
