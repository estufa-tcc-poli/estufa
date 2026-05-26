import {
  WireChart,
  WirePageHeader,
  WireSensorCard,
} from "@/components/wireframe";

export default function HomePage() {
  return (
    <>
      <WirePageHeader
        title="Home — Dashboard"
        subtitle="Visão geral dos sensores e tendência"
      />

      <section aria-label="Cards de sensores">
        <p className="mb-3 text-xs font-bold uppercase text-neutral-500">
          Sensores (4 cards)
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <WireSensorCard name="Temperatura" value="24,5" unit="°C" />
          <WireSensorCard name="Umidade" value="62" unit="%" />
          <WireSensorCard name="Luminosidade" value="450" unit="lux" />
          <WireSensorCard name="CO₂" value="420" unit="ppm" />
        </div>
      </section>

      <section className="mt-8" aria-label="Gráfico principal">
        <WireChart title="Gráfico — leituras nas últimas horas" height="h-56" />
      </section>

      <footer className="mt-6 flex justify-between border-t border-dashed border-neutral-400 pt-4 text-xs text-neutral-500">
        <span>Atualizado: há 2 min</span>
        <span>[ Botão Atualizar ]</span>
      </footer>
    </>
  );
}
