# Copilot Instructions for voyage-georgia-rezo

## Project Overview

This is a React 19 + TypeScript + Vite single-page application with modern ESLint flat config. The project uses the latest React features including React 19.2.0 and follows strict TypeScript compilation settings.

## Architecture & Structure

- **Entry point**: `src/main.tsx` mounts the app to `#root` div using `createRoot` with StrictMode
- **Main component**: `src/App.tsx` contains the primary application logic
- **Styling**: Component-level CSS (`App.css`) + global styles (`index.css`)
- **Assets**: Static assets in `src/assets/` and `public/` (Vite serves `public/` at root path)

## Development Workflow

### Commands

- `npm run dev` - Start Vite dev server with HMR (Hot Module Replacement)
- `npm run build` - TypeScript compile + production build (outputs to `dist/`)
- `npm run lint` - Run ESLint on all files
- `npm run preview` - Preview production build locally

### TypeScript Configuration

- Uses **project references** with separate configs:
  - `tsconfig.app.json` - App source code in `src/`
  - `tsconfig.node.json` - Vite config files
- **Strict mode enabled** with additional safety checks:
  - `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`
  - `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noUncheckedSideEffectImports`
- **Module resolution**: `bundler` mode (Vite-specific)
- **JSX**: `react-jsx` (new JSX transform, no React import needed)

## Code Conventions

### ESLint (Flat Config)

- Uses new **ESLint flat config** (`eslint.config.js`) with `defineConfig` helper
- Key plugins: `typescript-eslint`, `react-hooks`, `react-refresh`
- Files pattern: `**/*.{ts,tsx}` (no `.js` files in source)
- Global ignores: `dist/` directory

### Import Styles

- **Static assets from `src/assets/`**: Use relative imports (`import reactLogo from './assets/react.svg'`)
- **Static assets from `public/`**: Use absolute paths (`src="/vite.svg"`)
- **No React import needed**: TSX files don't require `import React from 'react'` (uses new JSX transform)

### Styling Patterns

- CSS custom properties in `:root` for theming
- Light/dark color scheme support via `@media (prefers-color-scheme: light)`
- System font stack: `system-ui, Avenir, Helvetica, Arial, sans-serif`
- Accessibility considerations: `prefers-reduced-motion` for animations

## React 19 Specifics

- This project uses **React 19.2.0** (latest version as of 2025)
- StrictMode is enabled in `main.tsx` for development checks
- Component patterns follow function components with hooks (`useState`, etc.)

## Build & Bundle

- **Vite 7.2.2** handles bundling and dev server
- HMR configured for instant feedback on file changes
- Production builds output to `dist/` (excluded from version control and linting)
