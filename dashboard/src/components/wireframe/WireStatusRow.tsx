type WireStatusRowProps = {
  label: string;
  value: string;
  status?: "ok" | "warn" | "off";
};

export function WireStatusRow({
  label,
  value,
  status = "ok",
}: WireStatusRowProps) {
  const indicator =
    status === "ok"
      ? "●"
      : status === "warn"
        ? "◐"
        : "○";

  return (
    <div className="flex items-center justify-between border-2 border-neutral-800 p-4">
      <div className="flex items-center gap-3">
        <span className="text-lg font-mono">{indicator}</span>
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm text-neutral-600">{value}</span>
    </div>
  );
}
