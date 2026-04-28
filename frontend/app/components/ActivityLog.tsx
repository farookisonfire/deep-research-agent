import type { SSEEvent } from "@/lib/types";

const TOOL_LABELS: Record<string, string> = {
  web_search: "web search",
  wikipedia_search: "wikipedia",
};

const TOOL_ICONS: Record<string, string> = {
  web_search: "🌐",
  wikipedia_search: "📖",
};

interface Props {
  events: SSEEvent[];
}

export default function ActivityLog({ events }: Props) {
  if (events.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-6">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Activity
      </p>
      <div className="space-y-1 max-h-52 overflow-y-auto font-mono text-xs">
        {events.map((event, i) => {
          if (event.type === "planning") {
            if (event.message) {
              return (
                <div key={i} className="text-gray-500 dark:text-gray-400">
                  🧠 {event.message}
                </div>
              );
            }
            if (event.sub_questions?.length) {
              return (
                <div key={i} className="pl-4 space-y-0.5">
                  {event.sub_questions.map((q, j) => (
                    <div key={j} className="text-gray-400 dark:text-gray-500">
                      → {q}
                    </div>
                  ))}
                </div>
              );
            }
          }

          if (event.type === "researching") {
            if (event.tool && event.query) {
              return (
                <div key={i} className="pl-4 text-gray-400 dark:text-gray-500">
                  {TOOL_ICONS[event.tool] ?? "🔧"}{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    {TOOL_LABELS[event.tool] ?? event.tool}
                  </span>{" "}
                  <span className="text-blue-500 dark:text-blue-400">"{event.query}"</span>
                </div>
              );
            }
            if (event.message) {
              return (
                <div key={i} className="text-gray-500 dark:text-gray-400">
                  🔍 {event.message}
                </div>
              );
            }
          }

          if (event.type === "synthesizing") {
            return (
              <div key={i} className="text-gray-500 dark:text-gray-400">
                📊 {event.message ?? "Synthesizing findings…"}
              </div>
            );
          }

          if (event.type === "complete") {
            return (
              <div key={i} className="text-green-600 dark:text-green-400">
                ✓ Report ready
              </div>
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}
