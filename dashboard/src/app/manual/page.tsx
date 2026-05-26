import { WirePageHeader, WireToggle } from "@/components/wireframe";

export default function ManualPage() {
  return (
    <>
      <WirePageHeader
        title="Modo Manual"
        subtitle="Controle direto dos atuadores (sobrescreve automação)"
      />

      <div
        className="mb-4 border-2 border-dashed border-neutral-500 p-3 text-sm"
        role="note"
      >
        ⚠ Modo manual ativo — automação pausada
      </div>

      <section className="space-y-4" aria-label="Toggles de atuadores">
        <p className="text-xs font-bold uppercase text-neutral-500">
          Atuadores (3 toggles)
        </p>
        <WireToggle label="Ventilador" on />
        <WireToggle label="Bomba de irrigação" />
        <WireToggle label="Iluminação LED" on />
      </section>

      <div className="mt-8 border-2 border-neutral-800 p-4">
        <p className="text-sm font-bold">Estado consolidado</p>
        <ul className="mt-2 space-y-1 text-sm text-neutral-600">
          <li>• Ventilador: LIGADO</li>
          <li>• Bomba: DESLIGADO</li>
          <li>• LED: LIGADO</li>
        </ul>
      </div>
    </>
  );
}
