import { WirePageHeader, WireStatusRow } from "@/components/wireframe";

export default function StatusPage() {
  return (
    <>
      <WirePageHeader
        title="Status do Sistema"
        subtitle="Conectividade e saúde do dispositivo"
      />

      <section className="space-y-3" aria-label="Status de conexão">
        <WireStatusRow label="Wi-Fi" value="Conectado — Rede_Estufa" status="ok" />
        <WireStatusRow label="MQTT" value="Conectado — broker.local" status="ok" />
        <WireStatusRow label="Uptime" value="3d 14h 22m" status="ok" />
      </section>

      <section className="mt-8 space-y-3">
        <p className="text-xs font-bold uppercase text-neutral-500">
          Informações adicionais
        </p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="border border-neutral-400 p-3">
            <span className="text-neutral-500">IP local</span>
            <p className="font-mono font-bold">192.168.1.42</p>
          </div>
          <div className="border border-neutral-400 p-3">
            <span className="text-neutral-500">Firmware</span>
            <p className="font-mono font-bold">v1.2.0</p>
          </div>
          <div className="border border-neutral-400 p-3">
            <span className="text-neutral-500">Memória livre</span>
            <p className="font-mono font-bold">128 KB</p>
          </div>
          <div className="border border-neutral-400 p-3">
            <span className="text-neutral-500">Último reboot</span>
            <p className="font-mono font-bold">21/05 08:00</p>
          </div>
        </div>
      </section>

      <div className="mt-8 flex justify-center">
        <div className="border-2 border-neutral-800 px-6 py-2 text-sm">
          [ Reiniciar dispositivo ]
        </div>
      </div>
    </>
  );
}
