# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Grounded** is a POC for AI-grounded customer service features. The name comes from an electrical engineering metaphor: like a ground wire protects systems from voltage surges, this architecture "grounds" AI agents with organizational data to prevent hallucinations.

**Status:** Proof of Concept
**Stack:** Remix + React + TypeScript + Supabase + Tailwind CSS

## Build & Development Commands

```bash
# Install dependencies (from root)
npm install

# Development (from packages/customer-ui)
npm run dev          # Start Remix dev server with Vite

# Quality checks (from packages/customer-ui)
npm run lint         # ESLint
npm run typecheck    # TypeScript type checking

# Production (from packages/customer-ui)
npm run build        # Build for production
npm run serve        # Run production build
```

## Monorepo Structure

Managed by Lerna with npm workspaces:

```
packages/
├── customer-ui/           # Main customer support UI (active)
├── shared-ui/       # Shared components (placeholder)
└── schemas/         # Shared data schemas (placeholder)
```

## Architecture

### Role-Based System
Three user roles with different dashboards:
- **customer** → CustomerChat component
- **representative** → RepresentativeDashboard component
- **admin** → AdminDashboard component

### Data Model (Supabase)
- **profiles**: id, email, name, role, created_at
- **conversations**: id, customer_id, rep_id, status (waiting|active|closed), timestamps
- **messages**: id, conversation_id, sender_id, content, created_at

### Real-time Pattern
Components subscribe to Supabase Realtime for live updates:
```typescript
supabase.channel(`conversation-${id}`)
  .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${id}` }, handler)
  .subscribe();
```

## Environment Variables

Required in `packages/customer-ui/.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Key Files

- `packages/customer-ui/src/App.tsx` - Main routing and auth logic
- `packages/customer-ui/src/lib/database.types.ts` - TypeScript types for Supabase tables
- `packages/customer-ui/src/lib/supabase.ts` - Supabase client initialization

## Testing

Not yet configured. Tests are a stretch goal.
