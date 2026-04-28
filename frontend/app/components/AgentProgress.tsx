import { Fragment } from "react";

export type StepStatus = "pending" | "active" | "done";

export interface Steps {
  planning: StepStatus;
  researching: StepStatus;
  synthesizing: StepStatus;
  formatting: StepStatus;
}

interface Props {
  steps: Steps;
}

const STEPS: { key: keyof Steps; label: string; icon: string }[] = [
  { key: "planning", label: "Planning", icon: "🧠" },
  { key: "researching", label: "Researching", icon: "🔍" },
  { key: "synthesizing", label: "Synthesizing", icon: "📊" },
  { key: "formatting", label: "Formatting", icon: "📄" },
];

function StepNode({ status, icon, label }: { status: StepStatus; icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={[
          "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all",
          status === "active" && "bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500 animate-pulse",
          status === "done" && "bg-green-100 dark:bg-green-900",
          status === "pending" && "bg-gray-100 dark:bg-gray-800 opacity-40",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {status === "done" ? "✓" : icon}
      </div>
      <span
        className={[
          "text-xs font-medium",
          status === "active" && "text-blue-600 dark:text-blue-400",
          status === "done" && "text-green-600 dark:text-green-400",
          status === "pending" && "text-gray-400",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {label}
      </span>
    </div>
  );
}

export default function AgentProgress({ steps }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-5">
        Agent Progress
      </p>
      <div className="flex items-start">
        {STEPS.map((step, i) => (
          <Fragment key={step.key}>
            <StepNode
              status={steps[step.key]}
              icon={step.icon}
              label={step.label}
            />
            {i < STEPS.length - 1 && (
              <div
                className={[
                  "flex-1 h-0.5 mt-5 mx-2 transition-colors",
                  steps[step.key] === "done"
                    ? "bg-green-400 dark:bg-green-600"
                    : "bg-gray-200 dark:bg-gray-700",
                ].join(" ")}
              />
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
