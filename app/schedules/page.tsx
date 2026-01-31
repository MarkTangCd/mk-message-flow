"use client";

import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { AddScheduleModal } from "../components/AddScheduleModal";
import { Sidebar } from "../components/Sidebar";
import { schedulesApi, aiModelsApi } from "@/lib/api-client";
import { ScheduledTaskWithModel, AIModel } from "@/lib/types";

interface DisplaySchedule {
  id: string;
  time: string;
  cadence: string;
  title: string;
  status: string;
  model: string;
  prompt: string;
  indicatorColor: string;
  rawData: ScheduledTaskWithModel;
}

function getCadenceDisplay(task: ScheduledTaskWithModel): string {
  const type = task.schedule_type;
  if (type === "daily") return "Daily";
  if (type === "weekly") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    return task.day_of_week !== null ? days[task.day_of_week] : "Weekly";
  }
  if (type === "monthly") {
    return task.day_of_month !== null ? `${task.day_of_month}th of month` : "Monthly";
  }
  return type;
}

function getIndicatorColor(index: number): string {
  const colors = ["bg-accent-primary", "bg-accent-secondary", "bg-[#8B5CF6]", "bg-[#10B981]"];
  return colors[index % colors.length];
}

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<DisplaySchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiModels, setAiModels] = useState<AIModel[]>([]);

  useEffect(() => {
    loadSchedules();
    loadAiModels();
  }, []);

  async function loadSchedules() {
    try {
      setIsLoading(true);
      const response = await schedulesApi.getAll();
      if (response.success && response.data) {
        const displaySchedules: DisplaySchedule[] = response.data.map((task, index) => ({
          id: task.id.toString(),
          time: `${task.execution_hour.toString().padStart(2, "0")}:${task.execution_minute.toString().padStart(2, "0")}`,
          cadence: getCadenceDisplay(task),
          title: task.name,
          status: task.is_active ? "ACTIVE" : "INACTIVE",
          model: `${task.ai_model_company} ${task.ai_model_name}`,
          prompt: task.prompt_content.length > 30 
            ? task.prompt_content.substring(0, 30) + "..." 
            : task.prompt_content,
          indicatorColor: getIndicatorColor(index),
          rawData: task,
        }));
        setSchedules(displaySchedules);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedules");
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

  const handleCreateSchedule = async (draft: {
    taskName: string;
    model: string;
    prompt: string;
    frequency: "daily" | "weekly" | "monthly";
    hour: string;
    minute: string;
    notes: string;
  }) => {
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
      loadSchedules();
    } catch (err) {
      console.error("Failed to create schedule:", err);
    }
  };

  const handleDeleteSchedule = async (id: string) => {
    try {
      await schedulesApi.delete(parseInt(id));
      setSchedules((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete schedule:", err);
    }
  };

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
            <span className="text-sm font-medium text-text-tertiary">{schedules.length} schedules</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">Loading schedules...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="flex flex-col gap-3">
              {schedules.map((schedule) => (
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
                    <button 
                      onClick={() => handleDeleteSchedule(schedule.id)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <AddScheduleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleCreateSchedule}
        aiModels={aiModels}
      />
    </div>
  );
}
