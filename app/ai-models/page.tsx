"use client";

import React, { useState, useEffect } from "react";
import {
  Bot,
  BrainCircuit,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  Zap,
} from "lucide-react";
import { Sidebar } from "../components/Sidebar";
import { AddModelModal } from "../components/AddModelModal";
import { aiModelsApi } from "@/lib/api-client";
import { AIModel } from "@/lib/types";

const getIconForModel = (companyName: string) => {
  const icons: Record<string, typeof BrainCircuit> = {
    "OpenAI": BrainCircuit,
    "Anthropic": Sparkles,
    "Google": Bot,
    "default": Zap,
  };
  return icons[companyName] || icons["default"];
};

const getIconBgForModel = (index: number): string => {
  const colors = [
    "bg-accent-primary",
    "bg-accent-secondary", 
    "bg-[#6B7280]",
    "bg-[#8B5CF6]",
    "bg-[#10B981]",
    "bg-[#F59E0B]",
  ];
  return colors[index % colors.length];
};

interface DisplayModel {
  id: string;
  provider: string;
  name: string;
  notes: string;
  status: string;
  icon: typeof BrainCircuit;
  iconBg: string;
  rawData: AIModel;
}

export default function AIModelsPage() {
  const [models, setModels] = useState<DisplayModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    try {
      setIsLoading(true);
      const response = await aiModelsApi.getAll();
      if (response.success && response.data) {
        const displayModels: DisplayModel[] = response.data.map((model, index) => ({
          id: model.id.toString(),
          provider: model.company_name,
          name: model.model_name,
          notes: model.remark || "No notes provided",
          status: model.is_active ? "ACTIVE" : "INACTIVE",
          icon: getIconForModel(model.company_name),
          iconBg: getIconBgForModel(index),
          rawData: model,
        }));
        setModels(displayModels);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load AI models");
    } finally {
      setIsLoading(false);
    }
  }

  const handleCreateModel = async (input: { companyName: string; modelName: string; notes?: string }) => {
    try {
      await aiModelsApi.create({
        company_name: input.companyName,
        model_name: input.modelName,
        remark: input.notes,
      });
      setIsModalOpen(false);
      loadModels();
    } catch (err) {
      console.error("Failed to create model:", err);
    }
  };

  const handleDeleteModel = async (id: string) => {
    try {
      await aiModelsApi.delete(parseInt(id));
      setModels((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to delete model:", err);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-primary font-sans text-text-primary">
      <Sidebar activeItem="AI Models" />

      <main className="ml-[280px] flex-1">
        <div className="mx-auto max-w-[1160px] px-10 py-8">
          <header className="mb-10 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[40px] font-medium leading-tight">AI Models</h2>
              <p className="text-sm text-text-tertiary">Configure AI model providers</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 font-semibold text-white transition-opacity hover:opacity-90"
            >
              <Plus size={16} />
              <span>Add Model</span>
            </button>
          </header>

          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">
              CONFIGURED MODELS
            </span>
            <span className="text-sm font-medium text-text-tertiary">{models.length} models</span>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-text-secondary">Loading AI models...</div>
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : (
            <div className="space-y-4">
              {models.map((model) => (
                <ModelCard 
                  key={model.id} 
                  {...model} 
                  onDelete={() => handleDeleteModel(model.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <AddModelModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateModel}
      />
    </div>
  );
}

function ModelCard({
  provider,
  name,
  notes,
  status,
  icon: Icon,
  iconBg,
  onDelete,
}: DisplayModel & { onDelete?: () => void }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-border-primary bg-bg-surface p-5">
      <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon size={24} className="text-white" />
      </div>

      <div className="flex-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-serif text-lg font-medium text-text-primary">{provider}</p>
            <p className="text-sm text-text-secondary">{name}</p>
          </div>
          {status && (
            <span className="rounded bg-accent-primary px-2 py-1 font-mono text-[10px] font-bold tracking-wide text-white">
              {status}
            </span>
          )}
        </div>
        <p className="mt-1 text-[13px] text-text-tertiary">{notes}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
          aria-label={`Edit ${provider} model`}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={onDelete}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
          aria-label={`Delete ${provider} model`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
