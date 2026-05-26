type WireToggleProps = {
  label: string;
  on?: boolean;
};

export function WireToggle({ label, on = false }: WireToggleProps) {
  return (
    <div className="flex items-center justify-between border-2 border-neutral-800 p-4">
      <span className="font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-500">{on ? "LIGADO" : "DESLIGADO"}</span>
        <div
          className={`flex h-8 w-14 items-center border-2 border-neutral-800 px-0.5 ${
            on ? "justify-end bg-neutral-300" : "justify-start bg-neutral-100"
          }`}
        >
          <div className="h-6 w-6 border-2 border-neutral-800 bg-white" />
        </div>
      </div>
    </div>
  );
}
