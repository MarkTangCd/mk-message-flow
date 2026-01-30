"use client";

import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { clsx } from "clsx";

export type ScheduleFrequency = "daily" | "weekly" | "monthly";

export interface ScheduleDraft {
  taskName: string;
  model: string;
  prompt: string;
  frequency: ScheduleFrequency;
  hour: string;
  minute: string;
  notes: string;
}

interface AddScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (draft: ScheduleDraft) => void;
}

const MODEL_OPTIONS = ["GPT-4", "Claude Sonnet", "Gemini Pro"];

export function AddScheduleModal({ isOpen, onClose, onCreate }: AddScheduleModalProps) {
  const [taskName, setTaskName] = useState("");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [frequency, setFrequency] = useState<ScheduleFrequency>("daily");
  const [hour, setHour] = useState("09");
  const [minute, setMinute] = useState("00");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onCreate?.({ taskName, model, prompt, frequency, hour, minute, notes });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-[720px] flex-col overflow-hidden rounded-xl border border-border-primary bg-bg-surface"
      >
        <div className="flex items-center justify-between border-b border-border-primary px-6 py-5">
          <h2 className="font-serif text-2xl font-medium text-text-primary">Add Schedule</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
            aria-label="Close add schedule modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Task Name</label>
            <input
              value={taskName}
              onChange={(event) => setTaskName(event.target.value)}
              placeholder="e.g., Daily Market Analysis"
              className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">AI Model</label>
            <div className="relative">
              <select
                value={model}
                onChange={(event) => setModel(event.target.value)}
                className="h-11 w-full appearance-none rounded-lg border border-border-primary bg-bg-surface px-3 text-sm text-text-primary focus:outline-none"
              >
                <option value="" disabled>
                  Select a model
                </option>
                {MODEL_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-text-primary">Prompt</label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Enter the prompt for AI to generate the message..."
              className="min-h-[120px] w-full rounded-lg border border-border-primary p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] font-semibold tracking-[0.2em] text-text-tertiary">
              SCHEDULE
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-text-primary">Frequency</span>
              <div className="flex h-10 gap-1 rounded-lg bg-bg-muted p-1">
                {[
                  { label: "Daily", value: "daily" },
                  { label: "Weekly", value: "weekly" },
                  { label: "Monthly", value: "monthly" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFrequency(option.value as ScheduleFrequency)}
                    className={clsx(
                      "flex-1 rounded-md text-sm font-medium transition-colors",
                      frequency === option.value
                        ? "bg-bg-surface text-text-primary"
                        : "text-text-tertiary"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">Hour</label>
                <input
                  value={hour}
                  onChange={(event) => setHour(event.target.value)}
                  placeholder="09"
                  className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-sm font-medium text-text-primary">Minute</label>
                <input
                  value={minute}
                  onChange={(event) => setMinute(event.target.value)}
                  placeholder="00"
                  className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-text-primary">Notes</span>
              <span className="text-xs text-text-tertiary">Optional</span>
            </div>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add notes about this schedule..."
              className="min-h-[80px] w-full rounded-lg border border-border-primary p-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-border-primary px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border-primary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Create Schedule
          </button>
        </div>
      </form>
    </div>
  );
}
