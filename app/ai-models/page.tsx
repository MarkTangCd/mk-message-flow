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

const MODELS = [
  {
    id: "openai",
    provider: "OpenAI",
    name: "GPT-4",
    notes: "Primary model for market analysis and daily reports",
    status: "ACTIVE",
    icon: BrainCircuit,
    iconBg: "bg-accent-primary",
  },
  {
    id: "anthropic-sonnet",
    provider: "Anthropic",
    name: "Claude Sonnet 4.5",
    notes: "Used for weekly summaries and customer feedback analysis",
    status: "ACTIVE",
    icon: Sparkles,
    iconBg: "bg-accent-secondary",
  },
  {
    id: "google",
    provider: "Google",
    name: "Gemini Pro",
    notes: "Testing for technical documentation generation",
    icon: Bot,
    iconBg: "bg-[#6B7280]",
  },
  {
    id: "anthropic-opus",
    provider: "Anthropic",
    name: "Claude Opus 4.5",
    notes: "Premium model for complex analysis and strategic insights",
    status: "ACTIVE",
    icon: Zap,
    iconBg: "bg-[#8B5CF6]",
  },
];

export default function AIModelsPage() {
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
            <button className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 font-semibold text-white transition-opacity hover:opacity-90">
              <Plus size={16} />
              <span>Add Model</span>
            </button>
          </header>

          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">
              CONFIGURED MODELS
            </span>
            <span className="text-sm font-medium text-text-tertiary">{MODELS.length} models</span>
          </div>

          <div className="space-y-4">
            {MODELS.map((model) => (
              <ModelCard key={model.id} {...model} />
            ))}
          </div>
        </div>
      </main>
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
}: {
  provider: string;
  name: string;
  notes: string;
  status?: string;
  icon: typeof BrainCircuit;
  iconBg: string;
}) {
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-primary text-text-primary transition-colors hover:bg-bg-muted"
          aria-label={`Delete ${provider} model`}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
