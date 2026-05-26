type WireChartProps = {
  title: string;
  height?: string;
  bars?: number;
};

export function WireChart({
  title,
  height = "h-48",
  bars = 12,
}: WireChartProps) {
  const heights = [40, 65, 50, 80, 55, 70, 45, 90, 60, 75, 50, 85];

  return (
    <div className={`border-2 border-neutral-800 bg-white p-4 ${height}`}>
      <p className="mb-3 text-sm font-bold">{title}</p>
      <div className="flex h-[calc(100%-2rem)] items-end justify-between gap-1 border border-dashed border-neutral-400 px-2 pb-2 pt-6">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="flex-1 border border-neutral-700 bg-neutral-200"
            style={{ height: `${heights[i % heights.length]}%` }}
            aria-hidden
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-neutral-500">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}
