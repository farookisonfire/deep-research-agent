import ReactMarkdown from "react-markdown";
import type { EvaluatedEvent } from "@/lib/types";

interface Props {
  report: string;
  evaluation?: EvaluatedEvent | null;
}

function scoreColor(n: number) {
  if (n >= 8) return "text-green-600 dark:text-green-400";
  if (n >= 6) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function ScoreBadge({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className={`text-xl font-bold ${scoreColor(value)}`}>{value}/10</span>
      <span className="text-xs text-gray-400 dark:text-gray-500">{label}</span>
    </div>
  );
}

export default function ReportViewer({ report, evaluation }: Props) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
      <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-6">
        Research Report
      </p>

      <div className="report-body text-gray-800 dark:text-gray-200 text-sm leading-relaxed">
        <ReactMarkdown>{report}</ReactMarkdown>
      </div>

      {evaluation && (
        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-4">
            Quality Evaluation
          </p>
          <div className="flex gap-8 mb-3">
            <ScoreBadge label="Relevance" value={evaluation.relevance} />
            <ScoreBadge label="Completeness" value={evaluation.completeness} />
            <ScoreBadge label="Confidence" value={evaluation.confidence} />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 italic">{evaluation.notes}</p>
        </div>
      )}
    </div>
  );
}
