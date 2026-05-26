import { WireChart, WirePageHeader } from "@/components/wireframe";

export default function HistoricoPage() {
  return (
    <>
      <WirePageHeader
        title="Histórico"
        subtitle="Dados das últimas 24 horas"
      />

      <section
        className="mb-6 flex flex-wrap gap-3"
        aria-label="Filtros"
      >
        <p className="w-full text-xs font-bold uppercase text-neutral-500">
          Filtros
        </p>
        <div className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-xs">Sensor</span>
          <div className="flex h-10 items-center justify-between border-2 border-neutral-800 px-3 text-sm">
            <span>Temperatura</span>
            <span className="text-xs">▼</span>
          </div>
        </div>
        <div className="flex min-w-[140px] flex-1 flex-col gap-1">
          <span className="text-xs">Período</span>
          <div className="flex h-10 items-center justify-between border-2 border-neutral-800 px-3 text-sm">
            <span>Últimas 24h</span>
            <span className="text-xs">▼</span>
          </div>
        </div>
        <div className="flex min-w-[120px] flex-col gap-1">
          <span className="text-xs">&nbsp;</span>
          <div className="flex h-10 items-center justify-center border-2 border-neutral-800 bg-neutral-200 px-4 text-sm font-medium">
            Aplicar
          </div>
        </div>
      </section>

      <section aria-label="Gráfico de 24 horas">
        <WireChart
          title="Gráfico — histórico 24h (Temperatura)"
          height="h-64"
          bars={24}
        />
      </section>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs text-neutral-500">
        <span>Min: 18,2 °C</span>
        <span>Média: 23,1 °C</span>
        <span>Max: 28,7 °C</span>
      </div>
    </>
  );
}
