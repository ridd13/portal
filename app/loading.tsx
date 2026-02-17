export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-36 animate-pulse rounded-3xl bg-bg-secondary" />
      <div className="h-20 animate-pulse rounded-2xl bg-bg-secondary" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-bg-secondary"
          />
        ))}
      </div>
    </div>
  );
}
