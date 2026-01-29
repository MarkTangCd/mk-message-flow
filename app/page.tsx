"use client"
import React, { useState } from "react";
import { 
  Inbox, 
  Calendar, 
  Sparkles, 
  Star, 
  Settings, 
  Bell, 
  Plus, 
  Search,
  MoreHorizontal,
  Clock,
  LucideIcon
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { MessageDetailModal, type Message as ModalMessage } from "./components/MessageDetailModal";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: number;
  title: string;
  time: string;
  preview: string;
  status: string;
  model: string;
  isRead: boolean;
  content?: string;
  prompt?: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    title: "Market Analysis",
    time: "10:24 AM",
    preview: "Market trends show positive momentum in tech sector with increased trading volume...",
    status: "DELIVERED",
    model: "GPT-4",
    isRead: true,
    content: `Market trends show positive momentum in the tech sector with increased trading volume across major exchanges. The S&P 500 index gained 1.2% today, driven primarily by strong performance in technology and healthcare sectors.

Key highlights:
• Technology sector up 2.3% with notable gains in semiconductor companies
• Trading volume exceeded average by 15%
• Investor sentiment remains cautiously optimistic
• Federal Reserve policy decisions expected next week

Recommendations:
Consider maintaining current positions while monitoring upcoming economic indicators. The market shows signs of sustained growth, though volatility may increase as we approach the Fed announcement.`,
    prompt: "Analyze current market trends and provide a comprehensive daily briefing focusing on tech sector performance and overall market sentiment."
  },
  {
    id: 2,
    title: "Weekly Task Summary",
    time: "Yesterday",
    preview: "Completed 15 tasks this week. Key achievements include new feature deployment and...",
    status: "DRAFT",
    model: "Claude 3",
    isRead: true,
  },
  {
    id: 3,
    title: "Revenue Report Q4",
    time: "Oct 24",
    preview: "Revenue increased by 23% compared to last month. Total sales reached $1.2M with...",
    status: "SCHEDULED",
    model: "GPT-4",
    isRead: true,
  },
  {
    id: 4,
    title: "Customer Feedback Analysis",
    time: "Oct 22",
    preview: "Analyzed 247 customer reviews. Overall satisfaction improved by 12% this quarter...",
    status: "DELIVERED",
    model: "Gemini Pro",
    isRead: false,
  },
  {
    id: 5,
    title: "System Security Audit",
    time: "Oct 20",
    preview: "System scan completed. No critical vulnerabilities detected. 3 minor issues resolved...",
    status: "DELIVERED",
    model: "GPT-4",
    isRead: false,
  }
];

export default function Dashboard() {
  const [selectedMessage, setSelectedMessage] = useState<ModalMessage | null>(null);

  const handleMessageClick = (msg: Message) => {
    setSelectedMessage({
      id: msg.id.toString(),
      title: msg.title,
      generatedAt: msg.time, // Using time as generatedAt for demo
      model: msg.model,
      schedule: "Daily · 09:00 AM", // Hardcoded for demo
      status: (msg.status === "DELIVERED" ? "DELIVERED" : "PENDING"), // Simplified mapping
      content: msg.content || msg.preview,
      prompt: msg.prompt || "No prompt available for this message."
    });
  };

  return (
    <div className="flex min-h-screen bg-bg-primary font-sans text-text-primary">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[280px] border-r border-border-primary bg-bg-surface px-6 py-8">
        <div className="mb-12">
          <h1 className="font-serif text-2xl font-semibold text-text-primary">MessageFlow</h1>
          <p className="text-xs text-text-tertiary">AI Message Platform</p>
        </div>

        <nav className="space-y-1">
          <NavItem icon={Inbox} label="Messages" active badge="3" />
          <NavItem icon={Calendar} label="Schedules" />
          <NavItem icon={Sparkles} label="AI Models" />
          <NavItem icon={Star} label="Favorites" />
          <NavItem icon={Settings} label="Settings" className="mt-8" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-[280px] flex-1">
        <div className="mx-auto max-w-[1160px] px-10 py-8">
          {/* Header */}
          <header className="mb-12 flex items-start justify-between">
            <div>
              <h2 className="font-serif text-[40px] font-medium leading-tight">Messages</h2>
              <p className="text-sm text-text-tertiary">Your latest AI-generated messages</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-primary bg-bg-surface transition-colors hover:bg-bg-muted">
                <Bell size={20} className="text-text-primary" />
              </button>
              <button className="flex h-11 items-center gap-2 rounded-lg bg-accent-primary px-4 font-semibold text-white transition-opacity hover:opacity-90">
                <Plus size={16} />
                <span>New Schedule</span>
              </button>
            </div>
          </header>

          {/* Search Bar */}
          <div className="mb-8 flex h-12 w-full items-center gap-3 rounded-lg border border-border-primary bg-bg-surface px-4">
            <Search size={18} className="text-text-muted" />
            <input 
              type="text" 
              placeholder="Search messages..." 
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
            />
          </div>

          {/* Section Header */}
          <div className="mb-6 flex items-center justify-between border-b border-border-primary pb-4">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-text-tertiary">RECENT MESSAGES</span>
            <span className="text-sm font-medium text-text-tertiary">8 messages</span>
          </div>

          {/* Message List */}
          <div className="space-y-0">
            {MESSAGES.map((msg) => (
              <MessageItem 
                key={msg.id} 
                {...msg} 
                onClick={() => handleMessageClick(msg)}
              />
            ))}
          </div>
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

function NavItem({ 
  icon: Icon, 
  label, 
  active = false, 
  badge, 
  className 
}: { 
  icon: LucideIcon; 
  label: string; 
  active?: boolean; 
  badge?: string;
  className?: string;
}) {
  return (
    <a 
      href="#" 
      className={cn(
        "flex h-11 items-center justify-between rounded-lg px-3 transition-colors",
        active ? "bg-accent-primary text-white" : "text-text-tertiary hover:bg-bg-muted hover:text-text-primary",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Icon size={20} />
        <span className="text-sm font-medium">{label}</span>
      </div>
      {badge && (
        <span className={cn(
          "flex h-5 items-center justify-center rounded-full px-2 font-mono text-[10px] font-bold",
          active ? "bg-white text-accent-primary" : "bg-bg-muted text-text-tertiary"
        )}>
          {badge}
        </span>
      )}
    </a>
  );
}

function MessageItem({ title, time, preview, status, model, isRead, onClick }: Message & { onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col gap-1 border-b border-border-primary py-5 transition-colors hover:bg-white/50"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isRead && (
            <div className="h-2 w-2 rounded-full bg-accent-primary" />
          )}
          <h3 className="font-medium text-text-primary">{title}</h3>
        </div>
        <span className="text-xs text-text-tertiary">{time}</span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded bg-bg-muted px-2 py-0.5">
          <Clock size={12} className="text-text-tertiary" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{status}</span>
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
            // Handle menu click
          }}
        >
          <MoreHorizontal size={18} />
        </button>
      </div>
    </div>
  );
}
