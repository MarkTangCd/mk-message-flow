"use client"
import React, { useState } from "react";
import {
  Clock,
  MoreHorizontal,
  Search,
  Sparkles,
  Star,
} from "lucide-react";
import { MessageDetailModal, type Message as ModalMessage } from "../components/MessageDetailModal";
import { Sidebar } from "../components/Sidebar";

interface FavoriteMessage {
  id: number;
  title: string;
  time: string;
  preview: string;
  status: string;
  model: string;
  content?: string;
  prompt?: string;
}

const FAVORITE_MESSAGES: FavoriteMessage[] = [
  {
    id: 1,
    title: "Product Roadmap Q1",
    time: "Oct 28",
    preview: "Comprehensive roadmap outlining key milestones for Q1 2024 including feature releases...",
    status: "DELIVERED",
    model: "GPT-4",
    content: `Comprehensive roadmap outlining key milestones for Q1 2024 including feature releases, team expansion, and market expansion strategies.

Key Milestones:
• January: Launch v2.0 with enhanced AI capabilities
• February: Expand team by 15 members
• March: Enter European market

Resource Allocation:
- Engineering: 60%
- Marketing: 25%
- Operations: 15%

Expected outcomes include 40% user growth and establishment of European presence.`,
    prompt: "Create a detailed Q1 2024 product roadmap with milestones and resource allocation."
  },
  {
    id: 2,
    title: "Competitive Analysis",
    time: "Oct 25",
    preview: "Analysis of top 3 competitors reveals opportunities in AI customization and pricing...",
    status: "DELIVERED",
    model: "Claude 3",
    content: `Analysis of top 3 competitors reveals opportunities in AI customization and pricing flexibility.

Competitor A:
- Strengths: Strong brand recognition
- Weaknesses: Limited customization options
- Pricing: Premium tier at $99/month

Competitor B:
- Strengths: Affordable entry point
- Weaknesses: Limited enterprise features
- Pricing: Freemium model

Opportunities identified:
1. Mid-tier pricing gap
2. Enhanced customization features
3. Better enterprise onboarding`,
    prompt: "Analyze our top 3 competitors and identify market opportunities."
  },
  {
    id: 3,
    title: "User Interview Summary",
    time: "Oct 22",
    preview: "Summary of 12 user interviews highlighting key pain points and feature requests...",
    status: "DELIVERED",
    model: "GPT-4",
    content: `Summary of 12 user interviews highlighting key pain points and feature requests.

Top Pain Points:
1. Difficulty finding scheduled messages (8/12 users)
2. Limited export options (6/12 users)
3. Notification timing issues (5/12 users)

Most Requested Features:
• Bulk message actions (9/12 users)
• Dark mode support (7/12 users)
• Integration with Slack (6/12 users)

Satisfaction Score: 4.2/5.0
NPS: +42`,
    prompt: "Summarize findings from 12 user interviews focusing on pain points and feature requests."
  },
  {
    id: 4,
    title: "Technical Architecture Review",
    time: "Oct 18",
    preview: "Review of current architecture with recommendations for scalability improvements...",
    status: "DELIVERED",
    model: "Gemini Pro",
    content: `Review of current architecture with recommendations for scalability improvements.

Current State:
- Monolithic application structure
- Single database instance
- Synchronous processing pipeline

Recommendations:
1. Migrate to microservices architecture
2. Implement read replicas for database
3. Add message queue for async processing
4. Implement caching layer with Redis

Estimated effort: 3-4 months
Expected benefits: 10x throughput improvement`,
    prompt: "Review our technical architecture and provide scalability recommendations."
  }
];

export default function FavoritesPage() {
  const [selectedMessage, setSelectedMessage] = useState<ModalMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleMessageClick = (msg: FavoriteMessage) => {
    setSelectedMessage({
      id: msg.id.toString(),
      title: msg.title,
      generatedAt: msg.time,
      model: msg.model,
      schedule: "Daily · 09:00 AM",
      status: (msg.status === "DELIVERED" ? "DELIVERED" : "PENDING"),
      content: msg.content || msg.preview,
      prompt: msg.prompt || "No prompt available for this message."
    });
  };

  const filteredMessages = FAVORITE_MESSAGES.filter(msg =>
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
            <span className="text-sm font-medium text-text-tertiary">{filteredMessages.length} messages</span>
          </div>

          <div className="space-y-0">
            {filteredMessages.map((msg) => (
              <FavoriteMessageItem
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

function FavoriteMessageItem({ title, time, preview, status, model, onClick }: FavoriteMessage & { onClick?: () => void }) {
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
          <span className="text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">{status}</span>
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
