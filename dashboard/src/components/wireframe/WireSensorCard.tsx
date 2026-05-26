type WireSensorCardProps = {
  name: string;
  value: string;
  unit: string;
};

export function WireSensorCard({ name, value, unit }: WireSensorCardProps) {
  return (
    <div className="border-2 border-neutral-800 bg-white p-4">
      <p className="text-xs uppercase text-neutral-500">{name}</p>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-2xl font-bold">{value}</span>
        <span className="text-sm text-neutral-600">{unit}</span>
      </div>
      <div className="mt-3 h-8 border border-dashed border-neutral-400 bg-neutral-100" />
    </div>
  );
}
