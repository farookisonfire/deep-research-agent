"use client";

import { useRef, useState } from "react";
import QueryInput from "./components/QueryInput";
import AgentProgress, { type Steps } from "./components/AgentProgress";
import ActivityLog from "./components/ActivityLog";
import ReportViewer from "./components/ReportViewer";
import { readSSEStream } from "@/lib/stream";
import type { EvaluatedEvent, SSEEvent } from "@/lib/types";

const INITIAL_STEPS: Steps = {
  planning: "pending",
  researching: "pending",
  synthesizing: "pending",
  formatting: "pending",
};

export default function Home() {
  const [steps, setSteps] = useState<Steps>(INITIAL_STEPS);
  const [events, setEvents] = useState<SSEEvent[]>([]);
  const [report, setReport] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluatedEvent | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  function cancel() {
    abortRef.current?.abort();
  }

  async function handleSubmit(query: string) {
    abortRef.current = new AbortController();
    setSteps(INITIAL_STEPS);
    setEvents([]);
    setReport(null);
    setEvaluation(null);
    setError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) throw new Error(`Request failed: ${response.status}`);

      for await (const event of readSSEStream(response)) {
        applyEvent(event);
        setEvents((prev) => [...prev, event]);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        // user cancelled — not an error
      } else {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  function applyEvent(event: SSEEvent) {
    switch (event.type) {
      case "planning":
        if (event.message) {
          setSteps((s) => ({ ...s, planning: "active" }));
        } else if (event.sub_questions?.length) {
          setSteps((s) => ({ ...s, planning: "done" }));
        }
        break;
      case "researching":
        setSteps((s) => ({
          ...s,
          planning: s.planning !== "done" ? "done" : s.planning,
          researching: "active",
        }));
        break;
      case "synthesizing":
        setSteps((s) => ({ ...s, researching: "done", synthesizing: "active" }));
        break;
      case "complete":
        setSteps((s) => ({ ...s, synthesizing: "done", formatting: "done" }));
        setReport(event.report);
        break;
      case "evaluated":
        setEvaluation(event);
        break;
      case "error":
        setError(event.message);
        break;
    }
  }

  const showProgress = loading || Object.values(steps).some((s) => s !== "pending");

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Deep Research Agent
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Powered by GPT-4o-mini + LangGraph
          </p>
        </header>

        <QueryInput onSubmit={handleSubmit} disabled={loading} />

        {loading && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={cancel}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors underline"
            >
              Cancel
            </button>
          </div>
        )}

        {showProgress && <AgentProgress steps={steps} />}

        {events.length > 0 && <ActivityLog events={events} />}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {report && <ReportViewer report={report} evaluation={evaluation} />}
      </div>
    </main>
  );
}
