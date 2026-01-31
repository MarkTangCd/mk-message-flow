# Repository Guidelines

## Project Overview

Next.js 16 App Router application with React 19, TypeScript, and Tailwind CSS v4. AI message platform called "MessageFlow" with dashboard UI for messages, schedules, AI models, and favorites.

## Project Structure

```
app/                    # Next.js App Router
├── layout.tsx         # Root layout with fonts (Inter, Newsreader, JetBrains Mono)
├── page.tsx           # Dashboard (Messages view)
├── globals.css        # Tailwind v4 theme variables
├── components/        # Shared React components
├── schedules/         # Schedule management page
├── ai-models/         # AI model configuration page
├── favorites/         # Favorites page
├── api/               # API routes
│   ├── messages/      # Messages CRUD
│   ├── schedules/     # Schedules CRUD
│   ├── ai-models/     # AI models CRUD
│   ├── cron/execute-schedules/  # Cron job for AI execution
│   └── favorites/     # Favorites API
lib/
├── types.ts           # TypeScript types
├── db.ts              # PostgreSQL connection
├── api-client.ts      # Client API wrapper
├── ai-service.ts      # AI execution with OpenRouter
├── schedule-utils.ts  # Schedule query utilities
└── model-mapping.ts   # OpenRouter model ID generation
public/                # Static assets
```

## Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000

# Production
npm run build        # Create production build
npm run start        # Run production server

# Linting
npm run lint         # Run ESLint
```

**Note:** No test framework configured. Install Jest/Vitest/Playwright to add tests.

## Code Style

### Language & Framework
- TypeScript with strict mode enabled
- React 19 with Next.js 16 App Router
- Client components: mark with `"use client"` when using hooks/browser APIs

### Formatting
- Indentation: 2 spaces
- Quotes: Double quotes
- Semicolons: Required
- Line length: ~100 characters

### Imports (ordered)
```typescript
// 1. React/Next.js
import React, { useState } from "react";
import type { Metadata } from "next";

// 2. Third-party (alphabetical)
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 3. Lucide icons
import { Bell, Plus } from "lucide-react";

// 4. Local
import { Sidebar } from "./components/Sidebar";
import type { Message } from "@/lib/types";
```

### Naming
- Components: PascalCase (`MessageDetailModal.tsx`)
- Functions/variables: camelCase (`handleClick`)
- Interfaces: PascalCase (`MessageProps`)
- Constants: UPPER_SNAKE_CASE
- Use `type` for unions, `interface` for objects

### TypeScript Patterns
```typescript
// Props interface
interface MessageProps {
  id: string;
  status: "DELIVERED" | "PENDING" | "FAILED";
}

// Function component
export function MessageCard({ id, status }: MessageProps) {
  if (!id) return null;
  return <div>{status}</div>;
}

// Default export for pages
export default function Dashboard() {
  const [items, setItems] = useState<Item[]>([]);
}
```

### Tailwind CSS v4
Class ordering: Layout → Sizing → Spacing → Borders → Background → Typography → Effects

```typescript
className={clsx(
  "flex h-11 items-center justify-between rounded-lg px-3",
  active ? "bg-accent-primary text-white" : "text-text-tertiary"
)}
```

Theme tokens: `bg-bg-primary`, `text-text-primary`, `border-border-primary`, `font-serif`, etc.

### React Patterns
```typescript
// State with explicit types
const [isOpen, setIsOpen] = useState(false);
const [message, setMessage] = useState<Message | null>(null);

// Event handlers
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  onCreate?.({ name });
};

// Conditional rendering
if (!isOpen) return null;
```

### Database/API
```typescript
// API route structure
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(): Promise<NextResponse> {
  const result = await query<Message>("SELECT * FROM messages");
  return NextResponse.json({ success: true, data: result.rows });
}
```

### Error Handling
- Use TypeScript strict mode
- Handle event propagation: `e.stopPropagation()`
- Optional chaining: `onCreate?.(...)`
- Fallback values: `msg.content || msg.preview`

### Accessibility
- `aria-label` on icon-only buttons
- Semantic HTML (`<header>`, `<main>`, `<nav>`)
- Proper heading hierarchy (`h1` → `h2`)
- `htmlFor` on labels

## Environment Variables

```bash
# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=messageflow
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-...
USE_ONLINE_MODE=true  # Enable real-time web search
```

## Dependencies

- `next`: 16.1.4, `react`: 19.2.3, `typescript`: ^5
- `tailwindcss`: ^4, `clsx`, `tailwind-merge`, `lucide-react`
- `pg`: PostgreSQL driver
- `ai`, `@openrouter/ai-sdk-provider`: AI SDK
- `eslint`: ^9, `eslint-config-next`: 16.1.4

## Config Notes

- Path alias: `@/*` maps to `./*`
- Fonts loaded via `next/font/google`
- Tailwind v4 uses CSS-based config in `globals.css`
- Cron job configured in `vercel.json` (runs every minute)

## Commits

Use Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
Imperative mood: "Add feature" not "Added feature"
