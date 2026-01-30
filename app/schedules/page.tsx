"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AddScheduleModal } from "../components/AddScheduleModal";
import { Sidebar } from "../components/Sidebar";

const SCHEDULES = [
  {
    id: "daily-market",
    time: "09:00",
    cadence: "Daily",
    title: "Daily Market Analysis",
    status: "ACTIVE",
    model: "GPT-4",
    prompt: "Market trends analysis",
    indicatorColor: "bg-accent-primary",
  },
  {
    id: "weekly-summary",
    time: "08:00",
    cadence: "Monday",
    title: "Weekly Project Summary",
    status: "ACTIVE",
    model: "Claude Sonnet",
    prompt: "Weekly progress summary",
    indicatorColor: "bg-accent-secondary",
  },
  {
    id: "monthly-revenue",
    time: "10:00",
    cadence: "1st of month",
    title: "Monthly Revenue Report",
    status: "ACTIVE",
    model: "GPT-4",
    prompt: "Financial analysis report",
    indicatorColor: "bg-[#8B5CF6]",
  },
];

export default function SchedulesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-bg-primary font-sans text-text-primary">
      <Sidebar activeItem="Schedules" />

      <main className="ml-[280px] flex-1">
        <div className="mx-auto max-w-[1160px] px-10 py-8">
          <header className="mb-10 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[40px] font-medium leading-tight">Schedules</h2>
              <p className="text-sm text-text-tertiary">
                Manage automated message generation
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              <span>Add Schedule</span>
            </button>
          </header>

          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">
              ACTIVE SCHEDULES
            </span>
            <span className="text-sm font-medium text-text-tertiary">5 schedules</span>
          </div>

          <div className="flex flex-col gap-3">
            {SCHEDULES.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center gap-5 rounded-xl border border-border-primary bg-bg-surface p-5"
              >
                <div
                  className={`h-20 w-1 rounded-sm ${schedule.indicatorColor}`}
                  aria-hidden="true"
                />
                <div className="flex w-[100px] flex-col gap-0.5">
                  <span className="font-mono text-[20px] font-semibold text-text-primary">
                    {schedule.time}
                  </span>
                  <span className="text-xs text-text-tertiary">{schedule.cadence}</span>
                </div>

                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-serif text-lg font-medium text-text-primary">
                      {schedule.title}
                    </h3>
                    <span className="rounded bg-accent-primary px-2 py-1 font-mono text-[10px] font-bold tracking-[0.04em] text-white">
                      {schedule.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <BrainCircuit size={14} />
                      <span className="text-sm">{schedule.model}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-tertiary">
                      <MessageSquare size={14} />
                      <span className="text-sm">{schedule.prompt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted">
                    <Pencil size={16} />
                  </button>
                  <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <AddScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
