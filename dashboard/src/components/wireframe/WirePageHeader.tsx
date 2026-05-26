type WirePageHeaderProps = {
  title: string;
  subtitle?: string;
};

export function WirePageHeader({ title, subtitle }: WirePageHeaderProps) {
  return (
    <header className="mb-6 border-b-2 border-dashed border-neutral-400 pb-4">
      <h1 className="text-xl font-bold">{title}</h1>
      {subtitle && (
        <p className="mt-1 text-sm text-neutral-600">{subtitle}</p>
      )}
    </header>
  );
}
