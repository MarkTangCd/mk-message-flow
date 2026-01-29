# Project Context: mk-message-flow

## Overview
`mk-message-flow` is a Next.js web application currently in its initial setup phase. It is built using the Next.js App Router and configured with TypeScript and Tailwind CSS.

**Key Technologies:**
-   **Framework:** Next.js 16.1.4 (App Router)
-   **UI Library:** React 19.2.3
-   **Language:** TypeScript
-   **Styling:** Tailwind CSS v4
-   **Linting:** ESLint

## Building and Running

The project uses `npm` for dependency management and script execution.

### Key Scripts
-   **Start Development Server:**
    ```bash
    npm run dev
    ```
    Runs the app in development mode at `http://localhost:3000`.

-   **Build for Production:**
    ```bash
    npm run build
    ```
    Builds the application for production deployment.

-   **Start Production Server:**
    ```bash
    npm run start
    ```
    Starts the Next.js production server (requires a successful build first).

-   **Lint Code:**
    ```bash
    npm run lint
    ```
    Runs ESLint to check for code quality and style issues.

## Development Conventions

### Project Structure
-   **`app/`**: Contains the application source code, following the Next.js App Router conventions.
    -   `page.tsx`: Main entry point/landing page.
    -   `layout.tsx`: Root layout definition.
    -   `globals.css`: Global styles and Tailwind directives.
-   **`public/`**: Static assets (images, fonts, etc.).
-   **Configuration Files:**
    -   `next.config.ts`: Next.js configuration.
    -   `tailwind.config.ts` (inferred from v4 usage/deps, or managed via CSS imports): Styling configuration.
    -   `tsconfig.json`: TypeScript configuration.
    -   `eslint.config.mjs`: ESLint configuration.

### Coding Style
-   **TypeScript:** Strict type checking is enabled. All new code should be fully typed.
-   **Styling:** Utility-first CSS using Tailwind. Avoid writing custom CSS in `globals.css` unless necessary for global resets or base styles.
-   **Components:** Functional components using React Hooks are the standard.

## Current State
The project is currently a fresh installation of `create-next-app` with no custom business logic or features implemented yet.
