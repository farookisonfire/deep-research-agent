"use client";

interface Props {
  onSubmit: (query: string) => void;
  disabled?: boolean;
}

export default function QueryInput({ onSubmit, disabled }: Props) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const input = e.currentTarget.elements.namedItem("query") as HTMLInputElement;
    const query = input.value.trim();
    if (query) onSubmit(query);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-8">
      <input
        name="query"
        type="text"
        placeholder="e.g. What are the most effective SEO strategies in 2025?"
        disabled={disabled}
        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled}
        className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? "Researching…" : "Research"}
      </button>
    </form>
  );
}
