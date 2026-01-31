# Repository Guidelines

## Project Overview

This is a Next.js 16 App Router application with React 19, TypeScript, and Tailwind CSS v4. It's an AI message platform called "MessageFlow" with a dashboard UI featuring messages, schedules, AI models, and favorites.

## Project Structure & Module Organization

- `app/` - Next.js App Router code
  - `layout.tsx` - Root layout with font configuration (Inter, Newsreader, JetBrains Mono)
  - `page.tsx` - Dashboard home page (Messages view)
  - `globals.css` - Global styles and Tailwind v4 theme variables
  - `components/` - Shared React components (Sidebar, modals, etc.)
  - `favorites/`, `schedules/`, `ai-models/` - Route segments with `page.tsx`
- `public/` - Static assets served at site root
- Config files at repo root: `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `postcss.config.mjs`

## Build, Test, and Development Commands

```bash
# Development
npm run dev          # Start dev server at http://localhost:3000 with HMR

# Production
npm run build        # Create production build
npm run start        # Run production server from build output

# Linting
npm run lint         # Run ESLint using Next.js + TypeScript config
```

**Note:** No test framework is currently configured. To add tests, install Jest/Vitest/Playwright and update this section.

## Code Style Guidelines

### Language & Framework
- **TypeScript**: Strict mode enabled (`strict: true` in tsconfig)
- **React**: Version 19 with Next.js 16 App Router
- **Client Components**: Mark with `"use client"` at the top of the file when using hooks or browser APIs

### Formatting & Indentation
- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Double quotes for strings, JSX attributes, and imports
- **Semicolons**: Use semicolons at the end of statements
- **Line Length**: Keep lines readable (aim for ~100 characters)

### Imports & Module Organization
```typescript
// 1. React and Next.js imports first
import React, { useState } from "react";
import Link from "next/link";
import type { Metadata } from "next";

// 2. Third-party libraries (alphabetical)
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// 3. Lucide icons (grouped together)
import { Bell, Plus, Search, X } from "lucide-react";

// 4. Local components and types (relative paths)
import { Sidebar } from "../components/Sidebar";
import { MessageDetailModal, type Message as ModalMessage } from "./components/MessageDetailModal";

// 5. Type imports use explicit `type` keyword
import type { LucideIcon } from "lucide-react";
```

### Naming Conventions
- **Components**: PascalCase (e.g., `MessageDetailModal.tsx`, `Sidebar.tsx`)
- **Component Functions**: PascalCase (e.g., `function MessageDetailModal()`)
- **Variables & Functions**: camelCase (e.g., `const [isOpen, setIsOpen] = useState()`)
- **Interfaces & Types**: PascalCase (e.g., `interface MessageDetailModalProps`)
- **Constants**: UPPER_SNAKE_CASE for true constants (e.g., `const MESSAGES = [...]`)
- **Type Aliases**: Use `type` for unions/complex types, `interface` for object shapes

### TypeScript Patterns

#### Interface Definitions
```typescript
// Props interfaces use ComponentName + Props
interface MessageDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: Message;
}

// Data interfaces describe domain entities
interface Message {
  id: string;
  title: string;
  status: "DELIVERED" | "PENDING" | "FAILED"; // Literal unions for enums
}

// Export types that are used across files
export interface ScheduleDraft {
  taskName: string;
  frequency: ScheduleFrequency;
}

export type ScheduleFrequency = "daily" | "weekly" | "monthly";
```

#### Function Components
```typescript
// Use function declarations for components
export function MessageDetailModal({
  isOpen,
  onClose,
  message,
}: MessageDetailModalProps) {
  if (!isOpen) return null;
  
  return (
    // JSX
  );
}

// Default exports for page components
export default function Dashboard() {
  // Component logic
}
```

### React Patterns

#### State Management
```typescript
// useState with explicit types when needed
const [isModalOpen, setIsModalOpen] = useState(false);
const [selectedMessage, setSelectedMessage] = useState<ModalMessage | null>(null);

// Event handlers defined inline or as nested functions
const handleMessageClick = (msg: Message) => {
  setSelectedMessage({
    id: msg.id.toString(),
    title: msg.title,
    // ...
  });
};
```

#### Conditional Rendering
```typescript
// Early return for null cases
if (!isOpen) return null;

// Conditional classes with clsx
className={clsx(
  "flex h-11 items-center justify-between rounded-lg px-3 transition-colors",
  active
    ? "bg-accent-primary text-white"
    : "text-text-tertiary hover:bg-bg-muted hover:text-text-primary"
)}
```

### Tailwind CSS v4 Patterns

#### Class Ordering (group by category)
1. **Layout**: `flex`, `grid`, `block`, `hidden`, `fixed`, `absolute`
2. **Sizing**: `w-full`, `h-11`, `min-h-screen`, `max-w-[1160px]`
3. **Spacing**: `px-6`, `py-8`, `gap-3`, `mb-10`, `ml-[280px]`
4. **Borders**: `rounded-lg`, `border`, `border-border-primary`
5. **Background**: `bg-bg-surface`, `bg-accent-primary`
6. **Typography**: `font-sans`, `font-serif`, `text-sm`, `text-text-primary`
7. **Effects**: `transition-colors`, `hover:bg-bg-muted`, `backdrop-blur-sm`

#### Custom Theme Tokens (defined in globals.css)
```css
/* Colors */
--color-background: var(--background);
--color-foreground: var(--foreground);
--color-accent-primary: var(--accent-primary);    /* #0D6E6E */
--color-accent-secondary: var(--accent-secondary); /* #E07B54 */
--color-bg-muted: var(--bg-muted);
--color-bg-surface: var(--bg-surface);
--color-border-primary: var(--border-primary);
--color-text-primary: var(--text-primary);
--color-text-secondary: var(--text-secondary);
--color-text-tertiary: var(--text-tertiary);
--color-text-muted: var(--text-muted);

/* Fonts */
--font-sans: var(--font-inter);
--font-serif: var(--font-newsreader);
--font-mono: var(--font-jetbrains-mono);
```

#### Utility Function for Classes
```typescript
// Use clsx + tailwind-merge for conditional classes
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Form Handling
```typescript
// Controlled inputs with explicit event types
const [taskName, setTaskName] = useState("");

<input
  value={taskName}
  onChange={(event) => setTaskName(event.target.value)}
  placeholder="e.g., Daily Market Analysis"
  className="h-11 w-full rounded-lg border border-border-primary px-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
/>

// Form submission
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();
  onCreate?.({ taskName, model, prompt, frequency, hour, minute, notes });
  onClose();
};
```

### Modal Pattern
```typescript
"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  // ... other props
}

export function Modal({ isOpen, onClose }: ModalProps) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-bg-surface w-full max-w-[600px] rounded-xl border border-border-primary shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border-primary flex justify-between items-center">
          <h2 className="font-serif text-2xl font-medium text-text-primary">Title</h2>
          <button onClick={onClose} className="...">
            <X size={18} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ... */}
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-border-primary flex justify-end gap-3">
          <button onClick={onClose} className="...">Cancel</button>
          <button className="...">Submit</button>
        </div>
      </div>
    </div>
  );
}
```

### Error Handling
- Use TypeScript's strict mode to catch errors at compile time
- Handle event propagation explicitly: `e.stopPropagation()` when needed
- Use optional chaining for potentially undefined values: `onCreate?.(...)`
- Provide fallback values: `msg.content || msg.preview`

### Accessibility
- Include `aria-label` on icon-only buttons
- Use semantic HTML (`<header>`, `<main>`, `<nav>`, `<aside>`)
- Ensure proper heading hierarchy (`h1` → `h2` → `h3`)
- Use `htmlFor` on labels associated with inputs

## Dependencies

### Core
- `next`: 16.1.4
- `react`: 19.2.3
- `react-dom`: 19.2.3
- `typescript`: ^5

### UI & Styling
- `tailwindcss`: ^4 (with `@tailwindcss/postcss`)
- `clsx`: ^2.1.1 (conditional classes)
- `tailwind-merge`: ^3.4.0 (merge Tailwind classes)
- `lucide-react`: ^0.563.0 (icons)

### Linting
- `eslint`: ^9
- `eslint-config-next`: 16.1.4

## Configuration Tips

- **Tailwind v4**: Uses CSS-based configuration in `globals.css` with `@import "tailwindcss"` and `@theme inline`
- **Path Aliases**: `@/*` maps to `./*` for imports
- **Fonts**: Loaded via `next/font/google` with CSS variables
- **Strict TypeScript**: All strict options enabled; avoid `any` types

## Commit & Pull Request Guidelines

- Follow lightweight Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`
- Use imperative mood: "Add feature" not "Added feature"
- Keep commits atomic and focused
- PRs should include: concise summary, key UI changes, screenshots for visual updates
