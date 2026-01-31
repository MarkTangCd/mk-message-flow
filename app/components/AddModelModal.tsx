"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

interface AddModelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate?: (input: { companyName: string; modelName: string; notes?: string }) => void;
}

export function AddModelModal({ isOpen, onClose, onCreate }: AddModelModalProps) {
  const [companyName, setCompanyName] = useState("");
  const [modelName, setModelName] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreate?.({
      companyName,
      modelName,
      notes: notes || undefined,
    });
    setCompanyName("");
    setModelName("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form onSubmit={handleSubmit} className="bg-bg-surface w-full max-w-[600px] rounded-xl border border-border-primary shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border-primary flex justify-between items-center">
          <h2 className="font-serif text-2xl font-medium text-text-primary">
            Add AI Model
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="companyName"
              className="text-[13px] font-medium text-text-primary"
            >
              Company Name
            </label>
            <input
              type="text"
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. OpenAI"
              required
              className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="modelName"
              className="text-[13px] font-medium text-text-primary"
            >
              Model Name
            </label>
            <input
              type="text"
              id="modelName"
              value={modelName}
              onChange={(e) => setModelName(e.target.value)}
              placeholder="e.g. GPT-4"
              required
              className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="notes"
                className="text-[13px] font-medium text-text-primary"
              >
                Notes
              </label>
              <span className="text-[11px] text-text-tertiary">Optional</span>
            </div>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this model..."
              className="h-[100px] w-full rounded-lg border border-border-primary p-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="p-6 border-t border-border-primary flex justify-end gap-3 bg-bg-surface">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-border-primary text-text-primary font-medium text-sm hover:bg-bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-lg bg-accent-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Add Model
          </button>
        </div>
      </form>
    </div>
  );
}
