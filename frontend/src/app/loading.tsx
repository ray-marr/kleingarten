export default function Loading() {
  return (
    <div className="flex h-64 items-center justify-center" aria-live="polite" aria-busy="true">
      <span className="inline-flex items-center gap-2 text-emerald-800">
        <svg
          className="h-6 w-6 animate-spin text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          role="img"
          aria-label="Laden"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>
        <span className="text-sm">Laden...</span>
      </span>
    </div>
  );
}
