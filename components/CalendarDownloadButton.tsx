"use client";

interface CalendarDownloadButtonProps {
  icsContent: string;
  filename: string;
}

export function CalendarDownloadButton({ icsContent, filename }: CalendarDownloadButtonProps) {
  const handleDownload = () => {
    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      className="rounded-full border border-accent-secondary px-4 py-2 text-sm font-semibold text-accent-secondary transition hover:bg-bg-secondary"
    >
      Zum Kalender hinzufügen
    </button>
  );
}
