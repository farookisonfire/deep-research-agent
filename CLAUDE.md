# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Purpose

A full-stack AI research tool. The app accepts a research query, runs it through a multi-node LangGraph pipeline, and streams real-time agent progress to the browser via SSE, ending with a rendered markdown report and an automated quality evaluation.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend | Python 3.11+, FastAPI |
| Agent | LangGraph |
| LLM | OpenAI (configurable) |
| Streaming | Server-Sent Events (SSE) |
| Package managers | `uv` (Python), `pnpm` (Node) |

## Commands

### Backend (Python / FastAPI)
```bash
cd backend
uv run fastapi dev main.py          # dev server with hot reload
uv run pytest                       # run all tests
uv run pytest tests/test_graph.py   # run single test file
uv run ruff check .                 # lint
uv run ruff format .                # format
```

### Frontend (Next.js)
```bash
cd frontend
pnpm dev                            # dev server
pnpm build && pnpm start            # production build
pnpm test                           # run tests
pnpm lint                           # ESLint
```

## Architecture

The system has three layers connected by SSE streaming:

```
Browser → Next.js API route (/api/research) → FastAPI (/research/stream) → LangGraph graph
```

The Next.js API route acts as a **proxy**: it forwards the query to FastAPI and re-streams the SSE response to the browser. This keeps the backend URL server-side only.

### LangGraph Pipeline (backend/agent/)

Five sequential nodes, each emitting a typed SSE event:

1. **Planner** (`nodes/planner.py`) — LLM call that decomposes the query into 3–5 sub-questions. Emits `{ type: "planning" }`.
2. **Researcher** (`nodes/researcher.py`) — Runs a tool-calling loop per sub-question using Tavily (web search) and Wikipedia. Emits `{ type: "researching", tool, query }`.
3. **Synthesizer** (`nodes/synthesizer.py`) — Aggregates raw findings into a coherent draft via LLM. Emits `{ type: "synthesizing" }`.
4. **Formatter** (`nodes/formatter.py`) — Converts draft to structured markdown with headings and sources. Emits `{ type: "complete", report }`.
5. **Evaluator** (`nodes/evaluator.py`) — Scores the report on relevance, completeness, and confidence (0–10). Emits `{ type: "evaluated", relevance, completeness, confidence, notes }`.

Graph state is defined as a `TypedDict` in `agent/state.py`. Nodes are composed in `agent/graph.py`.

### SSE Event Contract

All SSE events share a shape defined in `frontend/lib/types.ts` and validated with Zod on the frontend. The Python backend must emit events matching this schema — this is the cross-boundary contract that keeps both sides type-safe.

## Environment Variables

```bash
# backend/.env
OPENAI_API_KEY=...
TAVILY_API_KEY=...        # free tier at tavily.com
# MODEL=gpt-4o            # optional, defaults to gpt-4o-mini

# frontend/.env.local
BACKEND_URL=http://localhost:8000
```

Backend env is loaded via `pydantic-settings`; frontend via Next.js built-in `.env.local` support with `zod` validation at startup.
