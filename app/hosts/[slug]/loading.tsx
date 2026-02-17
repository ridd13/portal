export default function HostLoading() {
  return (
    <div className="space-y-6">
      <div className="h-52 animate-pulse rounded-3xl bg-bg-secondary" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-72 animate-pulse rounded-2xl bg-bg-secondary"
          />
        ))}
      </div>
    </div>
  );
}
