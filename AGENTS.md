# Repository Guidelines

## Project Structure & Module Organization
- `app/` contains the Next.js App Router code, including `layout.tsx`, `page.tsx`, and shared UI under `app/components/`.
- `public/` holds static assets served at the site root (e.g., images, icons).
- `app/globals.css` contains global styles; Tailwind v4 is configured via `postcss.config.mjs`.
- Config files live at the repo root (e.g., `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`).

## Build, Test, and Development Commands
- `npm run dev`: start the local dev server at `http://localhost:3000` with HMR.
- `npm run build`: create a production build with Next.js.
- `npm run start`: run the production server from the build output.
- `npm run lint`: run ESLint using the Next.js + TypeScript config.

## Coding Style & Naming Conventions
- Language: TypeScript + React (Next.js App Router).
- Follow the existing file style: 2-space indentation, double quotes, and semicolons where present.
- Component files use `PascalCase` (e.g., `MessageDetailModal.tsx`); variables and functions use `camelCase`.
- Keep Tailwind utility class lists grouped by layout → spacing → typography when editing JSX.

## Testing Guidelines
- No test framework is configured yet (no `__tests__` or `*.test.*` files).
- If you add tests, align naming with Jest/Vitest defaults (e.g., `Component.test.tsx`) and document the runner here.

## Commit & Pull Request Guidelines
- Commit messages appear to follow a lightweight Conventional Commits style (e.g., `feat: home page done`).
- Use a short, imperative subject and a clear scope if relevant (`feat:`, `fix:`, `chore:`).
- PRs should include: a concise summary, key UI changes, and screenshots for visual updates.

## Configuration Tips
- Tailwind v4 is enabled via `@tailwindcss/postcss`; keep custom CSS in `app/globals.css`.
- Update `next.config.ts` or `tsconfig.json` only when a change is required for the feature.
