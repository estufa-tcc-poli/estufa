type WireFormFieldProps = {
  label: string;
  placeholder?: string;
  type?: "text" | "number" | "select";
};

export function WireFormField({
  label,
  placeholder = "________",
  type = "text",
}: WireFormFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium">{label}</label>
      {type === "select" ? (
        <div className="flex h-10 items-center justify-between border-2 border-neutral-800 px-3 text-sm text-neutral-500">
          <span>{placeholder}</span>
          <span className="text-xs">▼</span>
        </div>
      ) : (
        <div className="h-10 border-2 border-neutral-800 px-3 text-sm leading-10 text-neutral-500">
          {placeholder}
        </div>
      )}
    </div>
  );
}
